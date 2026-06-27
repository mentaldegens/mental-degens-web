// Helius Enhanced Transactions API client
// Fetches and normalizes parsed swap transactions for a Solana wallet

export interface RawSwap {
  signature: string
  timestamp: number
  source: string
  tokenMint: string
  isBuy: boolean
  solAmount: number
  tokenAmount: number
}

const HELIUS_BASE = 'https://api.helius.xyz/v0'
const LAMPORTS    = 1_000_000_000
const MAX_PAGES   = 10
const DELAY_MS    = 300
const SOL_MINT    = 'So11111111111111111111111111111111111111112'

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function getTokenAmount(
  entry: { rawTokenAmount?: { tokenAmount: string; decimals: number }; tokenAmount?: number }
): number {
  if (entry.rawTokenAmount) {
    return Number(entry.rawTokenAmount.tokenAmount) /
      Math.pow(10, entry.rawTokenAmount.decimals)
  }
  return entry.tokenAmount ?? 0
}

function parseTransaction(tx: Record<string, unknown>, walletAddress: string): RawSwap[] {
  // Only process txns initiated by this wallet (feePayer = the signer)
  const feePayer = (tx.feePayer as string ?? '').toLowerCase()
  if (feePayer !== walletAddress.toLowerCase()) return []

  // Detect swap by presence of events.swap (catches SWAP, AMM buys/sells, Pump.fun, etc.)
  const events = tx.events as Record<string, unknown> | undefined
  const swap   = events?.swap as Record<string, unknown> | undefined
  if (!swap) return []

  const timestamp = (tx.timestamp as number) ?? 0
  const signature = (tx.signature as string) ?? ''
  const source    = (tx.source as string) ?? 'UNKNOWN'
  const results: RawSwap[] = []

  type TokenEntry = {
    userAccount?: string
    mint?: string
    rawTokenAmount?: { tokenAmount: string; decimals: number }
    tokenAmount?: number
  }

  const nativeInput  = swap.nativeInput  as { account?: string; amount?: string } | null | undefined
  const nativeOutput = swap.nativeOutput as { account?: string; amount?: string } | null | undefined
  const tokenOutputs = ((swap.tokenOutputs ?? []) as TokenEntry[]).filter(t => t.mint && t.mint !== SOL_MINT)
  const tokenInputs  = ((swap.tokenInputs  ?? []) as TokenEntry[]).filter(t => t.mint && t.mint !== SOL_MINT)

  // ── BUY: SOL in → Token out ───────────────────────────────────────────────
  if (nativeInput?.amount && tokenOutputs.length > 0) {
    const solAmount = Number(nativeInput.amount) / LAMPORTS
    if (solAmount >= 0.001) {
      // pick the non-SOL token with largest amount
      const best = tokenOutputs.reduce((a, b) =>
        getTokenAmount(b) > getTokenAmount(a) ? b : a
      )
      const tokenAmount = getTokenAmount(best)
      if (best.mint && tokenAmount > 0) {
        results.push({ signature, timestamp, source, tokenMint: best.mint, isBuy: true, solAmount, tokenAmount })
      }
    }
  }

  // ── SELL: Token in → SOL out ──────────────────────────────────────────────
  if (nativeOutput?.amount && tokenInputs.length > 0) {
    const solAmount = Number(nativeOutput.amount) / LAMPORTS
    if (solAmount >= 0.001) {
      const best = tokenInputs.reduce((a, b) =>
        getTokenAmount(b) > getTokenAmount(a) ? b : a
      )
      const tokenAmount = getTokenAmount(best)
      if (best.mint && tokenAmount > 0) {
        results.push({ signature, timestamp, source, tokenMint: best.mint, isBuy: false, solAmount, tokenAmount })
      }
    }
  }

  // ── Fallback: inspect innerSwaps for SOL↔token legs ──────────────────────
  if (results.length === 0) {
    type InnerSwap = {
      tokenInputs?: TokenEntry[]
      tokenOutputs?: TokenEntry[]
      nativeInput?: { amount?: string }
      nativeOutput?: { amount?: string }
    }
    const inner = (swap.innerSwaps ?? []) as InnerSwap[]
    for (const s of inner) {
      const iTokenOuts = (s.tokenOutputs ?? []).filter((t: TokenEntry) => t.mint && t.mint !== SOL_MINT)
      const iTokenIns  = (s.tokenInputs  ?? []).filter((t: TokenEntry) => t.mint && t.mint !== SOL_MINT)

      if (s.nativeInput?.amount && iTokenOuts.length > 0) {
        const sol = Number(s.nativeInput.amount) / LAMPORTS
        if (sol >= 0.001) {
          const best = iTokenOuts[0]
          const amt  = getTokenAmount(best)
          if (best.mint && amt > 0)
            results.push({ signature, timestamp, source, tokenMint: best.mint, isBuy: true, solAmount: sol, tokenAmount: amt })
        }
      }
      if (s.nativeOutput?.amount && iTokenIns.length > 0) {
        const sol = Number(s.nativeOutput.amount) / LAMPORTS
        if (sol >= 0.001) {
          const best = iTokenIns[0]
          const amt  = getTokenAmount(best)
          if (best.mint && amt > 0)
            results.push({ signature, timestamp, source, tokenMint: best.mint, isBuy: false, solAmount: sol, tokenAmount: amt })
        }
      }
    }
  }

  return results
}

export async function fetchSwaps(
  walletAddress: string,
  apiKey: string,
): Promise<{ swaps: RawSwap[]; totalFetched: number }> {
  const allSwaps: RawSwap[] = []
  let before: string | undefined
  let totalFetched = 0

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL(`${HELIUS_BASE}/addresses/${walletAddress}/transactions`)
    url.searchParams.set('api-key', apiKey)
    url.searchParams.set('limit', '100')
    if (before) url.searchParams.set('before', before)

    const res = await fetch(url.toString())
    if (!res.ok) {
      if (res.status === 429) throw new Error('Rate limited by Helius. Try again in a moment.')
      throw new Error(`Helius API error: ${res.status}`)
    }

    const txns = (await res.json()) as Record<string, unknown>[]
    if (!Array.isArray(txns) || txns.length === 0) break

    totalFetched += txns.length
    for (const tx of txns) allSwaps.push(...parseTransaction(tx, walletAddress))

    before = txns[txns.length - 1]?.signature as string | undefined
    if (txns.length < 100) break
    if (page < MAX_PAGES - 1) await sleep(DELAY_MS)
  }

  return { swaps: allSwaps, totalFetched }
}
