// Helius Enhanced Transactions API client
// Fetches and normalizes parsed swap transactions for a Solana wallet

export interface RawSwap {
  signature: string
  timestamp: number        // unix seconds
  source: string           // JUPITER, RAYDIUM, PUMP_FUN, ORCA, etc.
  tokenMint: string        // the non-SOL token
  isBuy: boolean           // true = SOL→token, false = token→SOL
  solAmount: number        // SOL (not lamports)
  tokenAmount: number      // raw token units
}

const HELIUS_BASE = 'https://api.helius.xyz/v0'
const LAMPORTS = 1_000_000_000
const MAX_PAGES = 10        // 10 × 100 = up to 1 000 txns
const DELAY_MS  = 300       // be polite to the API

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

// Normalise a single Helius transaction into 0-2 RawSwap records
function parseTransaction(tx: Record<string, unknown>, walletAddress: string): RawSwap[] {
  if (tx.type !== 'SWAP') return []

  const events = tx.events as Record<string, unknown> | undefined
  const swap   = events?.swap as Record<string, unknown> | undefined
  if (!swap) return []

  const timestamp = (tx.timestamp as number) ?? 0
  const signature = (tx.signature as string) ?? ''
  const source    = (tx.source as string) ?? 'UNKNOWN'
  const results: RawSwap[] = []

  // Helper: does this account belong to our wallet?
  const isOurs = (acct: string) =>
    acct?.toLowerCase() === walletAddress.toLowerCase()

  // ── BUY: SOL → Token ──────────────────────────────────────────────────────
  const nativeInput = swap.nativeInput as { account: string; amount: string } | null
  const tokenOutputs = (swap.tokenOutputs ?? []) as Array<{
    userAccount: string
    mint: string
    rawTokenAmount?: { tokenAmount: string; decimals: number }
    tokenAmount?: number
  }>

  if (nativeInput && isOurs(nativeInput.account) && tokenOutputs.length > 0) {
    const solAmount = Number(nativeInput.amount) / LAMPORTS
    // pick the largest token output (ignore intermediate router tokens)
    const best = tokenOutputs.reduce((a, b) => {
      const aAmt = a.rawTokenAmount
        ? Number(a.rawTokenAmount.tokenAmount)
        : (a.tokenAmount ?? 0)
      const bAmt = b.rawTokenAmount
        ? Number(b.rawTokenAmount.tokenAmount)
        : (b.tokenAmount ?? 0)
      return bAmt > aAmt ? b : a
    })
    const tokenAmount = best.rawTokenAmount
      ? Number(best.rawTokenAmount.tokenAmount) /
        Math.pow(10, best.rawTokenAmount.decimals)
      : (best.tokenAmount ?? 0)

    if (solAmount > 0 && best.mint) {
      results.push({
        signature, timestamp, source,
        tokenMint: best.mint,
        isBuy: true,
        solAmount,
        tokenAmount,
      })
    }
  }

  // ── SELL: Token → SOL ─────────────────────────────────────────────────────
  const nativeOutput = swap.nativeOutput as { account: string; amount: string } | null
  const tokenInputs = (swap.tokenInputs ?? []) as Array<{
    userAccount: string
    mint: string
    rawTokenAmount?: { tokenAmount: string; decimals: number }
    tokenAmount?: number
  }>

  if (nativeOutput && isOurs(nativeOutput.account) && tokenInputs.length > 0) {
    const solAmount = Number(nativeOutput.amount) / LAMPORTS
    const best = tokenInputs.reduce((a, b) => {
      const aAmt = a.rawTokenAmount
        ? Number(a.rawTokenAmount.tokenAmount)
        : (a.tokenAmount ?? 0)
      const bAmt = b.rawTokenAmount
        ? Number(b.rawTokenAmount.tokenAmount)
        : (b.tokenAmount ?? 0)
      return bAmt > aAmt ? b : a
    })
    const tokenAmount = best.rawTokenAmount
      ? Number(best.rawTokenAmount.tokenAmount) /
        Math.pow(10, best.rawTokenAmount.decimals)
      : (best.tokenAmount ?? 0)

    if (solAmount > 0 && best.mint) {
      results.push({
        signature, timestamp, source,
        tokenMint: best.mint,
        isBuy: false,
        solAmount,
        tokenAmount,
      })
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
    const url = new URL(
      `${HELIUS_BASE}/addresses/${walletAddress}/transactions`,
    )
    url.searchParams.set('api-key', apiKey)
    url.searchParams.set('type', 'SWAP')
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

    for (const tx of txns) {
      const parsed = parseTransaction(tx, walletAddress)
      allSwaps.push(...parsed)
    }

    // pagination cursor = signature of last transaction
    before = txns[txns.length - 1]?.signature as string | undefined
    if (txns.length < 100) break  // last page

    if (page < MAX_PAGES - 1) await sleep(DELAY_MS)
  }

  return { swaps: allSwaps, totalFetched }
}
