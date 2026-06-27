// Behavioral analysis engine
// Reconstructs closed positions using FIFO and calculates trading psychology metrics

import type { RawSwap } from './helius'

export interface ClosedTrade {
  tokenMint: string
  buyTimestamp: number
  sellTimestamp: number
  holdMs: number           // milliseconds held
  solCost: number          // SOL spent to enter
  solReceived: number      // SOL received on exit
  pnlSol: number           // net P&L in SOL
  pnlPercent: number       // % return
  isWin: boolean
  source: string
}

interface Lot {
  solCost: number
  tokenAmount: number
  timestamp: number
  source: string
}

// FIFO position reconstruction
// Why FIFO: most accurate reflection of actual holding periods for degen traders
// who typically hold a position open and close it — WACC would obscure true hold times
export function reconstructTrades(swaps: RawSwap[]): {
  closedTrades: ClosedTrade[]
  openPositions: Record<string, Lot[]>
} {
  // group swaps by token mint, sorted oldest first
  const byMint: Record<string, RawSwap[]> = {}
  for (const swap of swaps) {
    if (!byMint[swap.tokenMint]) byMint[swap.tokenMint] = []
    byMint[swap.tokenMint].push(swap)
  }

  const closedTrades: ClosedTrade[] = []
  const openPositions: Record<string, Lot[]> = {}

  for (const [mint, txns] of Object.entries(byMint)) {
    const sorted = [...txns].sort((a, b) => a.timestamp - b.timestamp)
    const lots: Lot[] = []

    for (const tx of sorted) {
      if (tx.isBuy) {
        lots.push({
          solCost: tx.solAmount,
          tokenAmount: tx.tokenAmount,
          timestamp: tx.timestamp,
          source: tx.source,
        })
      } else {
        // sell — match against earliest lots (FIFO)
        let remainingTokens = tx.tokenAmount
        let solCostBasis = 0
        let earliestBuyTs = tx.timestamp

        while (remainingTokens > 0 && lots.length > 0) {
          const lot = lots[0]
          if (lot.timestamp < earliestBuyTs) earliestBuyTs = lot.timestamp

          if (lot.tokenAmount <= remainingTokens) {
            // consume entire lot
            solCostBasis += lot.solCost
            remainingTokens -= lot.tokenAmount
            lots.shift()
          } else {
            // partial lot
            const fraction = remainingTokens / lot.tokenAmount
            solCostBasis += lot.solCost * fraction
            lot.solCost *= 1 - fraction
            lot.tokenAmount -= remainingTokens
            remainingTokens = 0
          }
        }

        if (solCostBasis > 0) {
          const pnlSol = tx.solAmount - solCostBasis
          closedTrades.push({
            tokenMint: mint,
            buyTimestamp: earliestBuyTs,
            sellTimestamp: tx.timestamp,
            holdMs: (tx.timestamp - earliestBuyTs) * 1000,
            solCost: solCostBasis,
            solReceived: tx.solAmount,
            pnlSol,
            pnlPercent: (pnlSol / solCostBasis) * 100,
            isWin: pnlSol > 0,
            source: tx.source,
          })
        }
      }
    }

    if (lots.length > 0) openPositions[mint] = lots
  }

  return { closedTrades, openPositions }
}

// ── Metric Calculations ───────────────────────────────────────────────────────

export function calcImpulseControl(trades: ClosedTrade[]): number {
  if (trades.length === 0) return 50
  let score = 55
  const HOUR = 3_600_000

  for (const t of trades) {
    const h = t.holdMs
    if (h < 15 * 60_000)       score -= 9   // < 15 min
    else if (h < HOUR)          score -= 4   // < 1 h
    else if (h < 4 * HOUR)      score -= 1   // < 4 h
    else if (h < 24 * HOUR)     score += 2   // < 24 h
    else if (h < 7 * 24 * HOUR) score += 4   // < 7 d
    else                         score += 6   // > 7 d
  }

  // bonus: if you hold winners longer than losers
  const wins  = trades.filter(t => t.isWin)
  const losses = trades.filter(t => !t.isWin)
  if (wins.length > 0 && losses.length > 0) {
    const avgWinHold  = wins.reduce((s, t) => s + t.holdMs, 0) / wins.length
    const avgLossHold = losses.reduce((s, t) => s + t.holdMs, 0) / losses.length
    if (avgWinHold > avgLossHold) score += 8
  }

  return Math.min(100, Math.max(0, Math.round(score)))
}

export function calcDiamondHands(trades: ClosedTrade[]): number {
  if (trades.length === 0) return 50
  const HOUR = 3_600_000
  const avgHold = trades.reduce((s, t) => s + t.holdMs, 0) / trades.length

  let score = 40
  if (avgHold > 7 * 24 * HOUR)      score = 95
  else if (avgHold > 3 * 24 * HOUR) score = 80
  else if (avgHold > 24 * HOUR)     score = 68
  else if (avgHold > 4 * HOUR)      score = 55
  else if (avgHold > HOUR)          score = 42
  else if (avgHold > 15 * 60_000)   score = 30
  else                               score = 15

  // bonus: ratio of winners held > 4h vs losses held > 4h
  const wins   = trades.filter(t => t.isWin)
  const longWin = wins.filter(t => t.holdMs > 4 * HOUR).length
  if (wins.length > 0 && longWin / wins.length > 0.5) score = Math.min(100, score + 8)

  return Math.min(100, Math.max(0, Math.round(score)))
}

export function calcWinRateQuality(trades: ClosedTrade[]): number {
  if (trades.length < 3) return 50
  const wins   = trades.filter(t => t.isWin)
  const losses = trades.filter(t => !t.isWin)
  const winRate = wins.length / trades.length          // 0-1

  const avgWin  = wins.length  > 0 ? wins.reduce((s, t) => s + t.pnlSol, 0) / wins.length   : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnlSol, 0) / losses.length) : 1
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 1  // ideally > 1

  // score = win rate component + profit factor component
  const wrScore = winRate * 60                                // 0-60
  const pfScore = Math.min(40, (profitFactor - 0.5) * 20)    // 0-40
  return Math.min(100, Math.max(0, Math.round(wrScore + pfScore)))
}

export function calcRiskManagement(trades: ClosedTrade[]): number {
  if (trades.length < 3) return 50
  const sizes = trades.map(t => t.solCost)
  const mean  = sizes.reduce((a, b) => a + b, 0) / sizes.length
  const std   = Math.sqrt(sizes.reduce((s, v) => s + (v - mean) ** 2, 0) / sizes.length)
  const cv    = mean > 0 ? std / mean : 1    // coefficient of variation — lower = more consistent

  // also check for suspiciously large positions (revenge trades)
  const maxSize = Math.max(...sizes)
  const revenge = maxSize > mean * 4 ? -10 : 0   // big spike = probable tilt

  let score = Math.round(Math.max(0, 90 - cv * 55)) + revenge
  return Math.min(100, Math.max(0, score))
}

export function calcEmotionalControl(trades: ClosedTrade[]): number {
  if (trades.length < 5) return 55
  let score = 65
  const sorted = [...trades].sort((a, b) => a.sellTimestamp - b.sellTimestamp)

  // detect loss streaks > 4
  let streak = 0
  let maxStreak = 0
  for (const t of sorted) {
    streak = t.isWin ? 0 : streak + 1
    maxStreak = Math.max(maxStreak, streak)
  }
  if (maxStreak >= 7) score -= 20
  else if (maxStreak >= 5) score -= 12
  else if (maxStreak >= 3) score -= 5

  // detect revenge: big position right after a loss
  for (let i = 1; i < sorted.length; i++) {
    if (!sorted[i - 1].isWin && sorted[i].solCost > sorted[i - 1].solCost * 2.5) {
      score -= 8
    }
  }

  // bonus: win streaks > 4 (controlled aggression)
  let wStreak = 0
  let maxWStreak = 0
  for (const t of sorted) {
    wStreak = t.isWin ? wStreak + 1 : 0
    maxWStreak = Math.max(maxWStreak, wStreak)
  }
  if (maxWStreak >= 5) score += 10

  return Math.min(100, Math.max(0, Math.round(score)))
}

export interface HoldBucket {
  label: string
  count: number
  wins: number
}

export function holdTimeBuckets(trades: ClosedTrade[]): HoldBucket[] {
  const HOUR = 3_600_000
  const buckets: HoldBucket[] = [
    { label: '< 15m',   count: 0, wins: 0 },
    { label: '15m-1h',  count: 0, wins: 0 },
    { label: '1h-4h',   count: 0, wins: 0 },
    { label: '4h-24h',  count: 0, wins: 0 },
    { label: '1d-7d',   count: 0, wins: 0 },
    { label: '> 7d',    count: 0, wins: 0 },
  ]

  for (const t of trades) {
    const h = t.holdMs
    const w = t.isWin ? 1 : 0
    if      (h < 15 * 60_000)       { buckets[0].count++; buckets[0].wins += w }
    else if (h < HOUR)               { buckets[1].count++; buckets[1].wins += w }
    else if (h < 4 * HOUR)          { buckets[2].count++; buckets[2].wins += w }
    else if (h < 24 * HOUR)         { buckets[3].count++; buckets[3].wins += w }
    else if (h < 7 * 24 * HOUR)     { buckets[4].count++; buckets[4].wins += w }
    else                             { buckets[5].count++; buckets[5].wins += w }
  }
  return buckets
}

export function cumulativePnl(trades: ClosedTrade[]): Array<{ n: number; pnl: number }> {
  const sorted = [...trades].sort((a, b) => a.sellTimestamp - b.sellTimestamp)
  let running = 0
  return sorted.map((t, i) => {
    running += t.pnlSol
    return { n: i + 1, pnl: Math.round(running * 1000) / 1000 }
  })
}
