// Helius Enhanced Transactions API client — full coverage rewrite
//
// Supported DEX sources (via Helius Enhanced Transactions):
//   events.swap present:  JUPITER, RAYDIUM, ORCA, LIFINITY, METEORA,
//                         OPENBOOK, ALDRIN, CROPPER, SABER, SERUM, DFLOW
//   events.swap absent:   PUMP_AMM → fallback via tokenTransfers/nativeTransfers
//
// For token→token swaps (USDC base, etc.) we cannot reconstruct SOL P&L
// without a price oracle, so we skip them and note them in dataQuality.skipped.

export interface RawSwap {
  signature: string
  timestamp:   number   // unix seconds
  source:      string
  tokenMint:   string
  isBuy:       boolean
  solAmount:   number   // SOL (not lamports)
  tokenAmount: number   // normalised token units
}

const HELIUS_BASE  = 'https://api.helius.xyz/v0'
const LAMPORTS     = 1_000_000_000
const MAX_PAGES    = 20           // 20 × 100 = up to 2 000 txns
const DELAY_MS     = 250
const MIN_SOL      = 0.0001      // lowered from 0.001 — catches small Pump.fun entries
const SOL_MINT     = 'So11111111111111111111111111111111111111112'
const WSOL_MINT    = 'So11111111111111111111111111111111111111112' // same as SOL
const USDC_MINT    = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const USDT_MINT    = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'

// stablecoins and SOL variants we treat as "base currency" (not the token being traded)
const BASE_MINTS = new Set([SOL_MINT, WSOL_MINT, USDC_MINT, USDT_MINT])

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// Normalise rawTokenAmount or fall back to pre-normalised tokenAmount
function getAmt(entry: {
  rawTokenAmount?: { tokenAmount: string; decimals: number }
  tokenAmount?:    number
}): number {
  if (entry.rawTokenAmount) {
    const n = Number(entry.rawTokenAmount.tokenAmount)
    const d = entry.rawTokenAmount.decimals ?? 0
    return n / Math.pow(10, d)
  }
  return entry.tokenAmount ?? 0
}

// ── Primary parser: uses events.swap ─────────────────────────────────────────
function parseViaEvents(
  tx: Record<string, unknown>,
  wallet: string,
): RawSwap[] {
  const feePayer = (tx.feePayer as string ?? '').toLowerCase()
  if (feePayer !== wallet.toLowerCase()) return []

  const swap = (tx.events as Record<string, unknown> | undefined)?.swap as
    Record<string, unknown> | undefined
  if (!swap) return []

  const ts  = (tx.timestamp as number) ?? 0
  const sig = (tx.signature as string) ?? ''
  const src = (tx.source    as string) ?? 'UNKNOWN'

  type TEntry = {
    userAccount?: string
    mint?:        string
    rawTokenAmount?: { tokenAmount: string; decimals: number }
    tokenAmount?: number
  }

  const natIn  = swap.nativeInput  as { amount?: string } | null
  const natOut = swap.nativeOutput as { amount?: string } | null
  // filter to non-base tokens only
  const tokOut = ((swap.tokenOutputs ?? []) as TEntry[]).filter(t => t.mint && !BASE_MINTS.has(t.mint))
  const tokIn  = ((swap.tokenInputs  ?? []) as TEntry[]).filter(t => t.mint && !BASE_MINTS.has(t.mint))

  const results: RawSwap[] = []

  // BUY: SOL → token
  if (natIn?.amount && tokOut.length > 0) {
    const sol = Number(natIn.amount) / LAMPORTS
    if (sol >= MIN_SOL) {
      // Pick token whose SOL-relative value is largest (highest SOL / token ratio = most expensive = most likely the target)
      // When amounts differ in magnitude we just pick largest raw amount — this correctly identifies the output token
      const best = tokOut.reduce((a, b) => getAmt(b) > getAmt(a) ? b : a)
      const amt  = getAmt(best)
      if (best.mint && amt > 0)
        results.push({ signature: sig, timestamp: ts, source: src, tokenMint: best.mint, isBuy: true, solAmount: sol, tokenAmount: amt })
    }
  }

  // SELL: token → SOL
  if (natOut?.amount && tokIn.length > 0) {
    const sol = Number(natOut.amount) / LAMPORTS
    if (sol >= MIN_SOL) {
      const best = tokIn.reduce((a, b) => getAmt(b) > getAmt(a) ? b : a)
      const amt  = getAmt(best)
      if (best.mint && amt > 0)
        results.push({ signature: sig, timestamp: ts, source: src, tokenMint: best.mint, isBuy: false, solAmount: sol, tokenAmount: amt })
    }
  }

  // Fallback to innerSwaps (multi-hop routes like Jupiter splits)
  if (results.length === 0) {
    type Inner = {
      nativeInput?:  { amount?: string }
      nativeOutput?: { amount?: string }
      tokenInputs?:  TEntry[]
      tokenOutputs?: TEntry[]
    }
    for (const s of ((swap.innerSwaps ?? []) as Inner[])) {
      const iOut = (s.tokenOutputs ?? []).filter((t: TEntry) => t.mint && !BASE_MINTS.has(t.mint!))
      const iIn  = (s.tokenInputs  ?? []).filter((t: TEntry) => t.mint && !BASE_MINTS.has(t.mint!))

      if (s.nativeInput?.amount && iOut.length > 0) {
        const sol = Number(s.nativeInput.amount) / LAMPORTS
        if (sol >= MIN_SOL) {
          const best = iOut[0]; const amt = getAmt(best)
          if (best.mint && amt > 0)
            results.push({ signature: sig, timestamp: ts, source: src, tokenMint: best.mint!, isBuy: true, solAmount: sol, tokenAmount: amt })
        }
      }
      if (s.nativeOutput?.amount && iIn.length > 0) {
        const sol = Number(s.nativeOutput.amount) / LAMPORTS
        if (sol >= MIN_SOL) {
          const best = iIn[0]; const amt = getAmt(best)
          if (best.mint && amt > 0)
            results.push({ signature: sig, timestamp: ts, source: src, tokenMint: best.mint!, isBuy: false, solAmount: sol, tokenAmount: amt })
        }
      }
    }
  }

  return results
}

// ── Fallback parser: uses tokenTransfers + nativeTransfers ────────────────────
// Covers PUMP_AMM, MOONSHOT, BELIEVE, and other AMMs without events.swap
function parseViaTransfers(
  tx: Record<string, unknown>,
  wallet: string,
): RawSwap[] {
  const feePayer = (tx.feePayer as string ?? '').toLowerCase()
  if (feePayer !== wallet.toLowerCase()) return []

  // Only attempt on transactions that look like swaps
  const type = (tx.type as string) ?? ''
  if (type !== 'SWAP' && type !== 'UNKNOWN') return []

  const ts  = (tx.timestamp as number) ?? 0
  const sig = (tx.signature as string) ?? ''
  const src = (tx.source    as string) ?? 'UNKNOWN'

  type NTx = { fromUserAccount?: string; toUserAccount?: string; amount?: number }
  type TTx = { fromUserAccount?: string; toUserAccount?: string; tokenAmount?: number; mint?: string }

  const nt = ((tx.nativeTransfers  ?? []) as NTx[])
  const tt = ((tx.tokenTransfers   ?? []) as TTx[]).filter(t => t.mint && !BASE_MINTS.has(t.mint))

  const w = wallet.toLowerCase()

  // net SOL change for wallet
  const solOut = nt.filter(n => n.fromUserAccount?.toLowerCase() === w)
                   .reduce((s, n) => s + (n.amount ?? 0), 0) / LAMPORTS
  const solIn  = nt.filter(n => n.toUserAccount?.toLowerCase()  === w)
                   .reduce((s, n) => s + (n.amount ?? 0), 0) / LAMPORTS

  const tokIn  = tt.filter(t => t.toUserAccount?.toLowerCase()   === w)
  const tokOut = tt.filter(t => t.fromUserAccount?.toLowerCase() === w)

  const results: RawSwap[] = []

  if (solOut > MIN_SOL && tokIn.length > 0) {
    const best = tokIn.reduce((a, b) => (b.tokenAmount ?? 0) > (a.tokenAmount ?? 0) ? b : a)
    if (best.mint && (best.tokenAmount ?? 0) > 0)
      results.push({ signature: sig, timestamp: ts, source: src, tokenMint: best.mint, isBuy: true,  solAmount: solOut, tokenAmount: best.tokenAmount ?? 0 })
  }

  if (solIn > MIN_SOL && tokOut.length > 0) {
    const best = tokOut.reduce((a, b) => (b.tokenAmount ?? 0) > (a.tokenAmount ?? 0) ? b : a)
    if (best.mint && (best.tokenAmount ?? 0) > 0)
      results.push({ signature: sig, timestamp: ts, source: src, tokenMint: best.mint, isBuy: false, solAmount: solIn, tokenAmount: best.tokenAmount ?? 0 })
  }

  return results
}

// ── Main fetch ────────────────────────────────────────────────────────────────
export async function fetchSwaps(
  walletAddress: string,
  apiKey: string,
): Promise<{ swaps: RawSwap[]; totalFetched: number; skipped: number }> {
  const allSwaps:  RawSwap[] = []
  const seen = new Set<string>()   // deduplicate by signature+side
  let before: string | undefined
  let totalFetched = 0
  let skipped = 0

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL(`${HELIUS_BASE}/addresses/${walletAddress}/transactions`)
    url.searchParams.set('api-key', apiKey)
    url.searchParams.set('limit',   '100')
    if (before) url.searchParams.set('before', before)

    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 8_000)

    let txns: Record<string, unknown>[]
    try {
      const res = await fetch(url.toString(), { signal: controller.signal })
      clearTimeout(timeout)
      if (!res.ok) {
        if (res.status === 429) throw new Error('Rate limited by Helius — try again in a moment.')
        throw new Error(`Helius API error: ${res.status}`)
      }
      txns = (await res.json()) as Record<string, unknown>[]
    } catch (err: unknown) {
      clearTimeout(timeout)
      if ((err as Error).name === 'AbortError') throw new Error('Helius request timed out. Try again.')
      throw err
    }

    if (!Array.isArray(txns) || txns.length === 0) break
    totalFetched += txns.length

    for (const tx of txns) {
      // Primary: events.swap
      let parsed = parseViaEvents(tx, walletAddress)

      // Fallback: tokenTransfers (PUMP_AMM, MOONSHOT, etc.)
      if (parsed.length === 0) {
        parsed = parseViaTransfers(tx, walletAddress)
        if (parsed.length === 0) {
          // If it looks like a swap but we couldn't parse it, count as skipped
          if ((tx.type as string) === 'SWAP') skipped++
        }
      }

      for (const s of parsed) {
        // Deduplicate: same signature + same direction should appear once
        const key = `${s.signature}:${s.isBuy}:${s.tokenMint}`
        if (!seen.has(key)) {
          seen.add(key)
          allSwaps.push(s)
        }
      }
    }

    before = txns[txns.length - 1]?.signature as string | undefined
    if (txns.length < 100) break
    if (page < MAX_PAGES - 1) await sleep(DELAY_MS)
  }

  return { swaps: allSwaps, totalFetched, skipped }
}
