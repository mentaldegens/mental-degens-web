// Behavioral analysis engine — audited & fixed
//
// Fixes applied:
//   1. FIFO floating-point: epsilon tolerance prevents negative remainingTokens
//   2. earliestBuyTs: initialised correctly from first matched lot
//   3. Impulse control: normalised per-trade (not raw sum)
//   4. Diamond Hands: uses median hold time (not average — no outlier skew)

import type { RawSwap } from './helius'

export interface ClosedTrade {
  tokenMint:     string
  buyTimestamp:  number   // unix seconds
  sellTimestamp: number
  holdMs:        number   // milliseconds
  solCost:       number
  solReceived:   number
  pnlSol:        number
  pnlPercent:    number
  isWin:         boolean
  source:        string
}

interface Lot {
  solCost:     number
  tokenAmount: number
  timestamp:   number
  source:      string
}

// FIFO position reconstruction
// Rationale: FIFO gives accurate hold times per entry, which is the core of
// the behavioral analysis. WACC would collapse all entries into one cost basis.
export function reconstructTrades(swaps: RawSwap[]): {
  closedTrades:  ClosedTrade[]
  openPositions: Record<string, Lot[]>
} {
  // Group by mint, sort oldest → newest within each group
  const byMint: Record<string, RawSwap[]> = {}
  for (const s of swaps) {
    ;(byMint[s.tokenMint] ??= []).push(s)
  }

  const closedTrades:  ClosedTrade[]        = []
  const openPositions: Record<string, Lot[]> = {}
  const EPSILON = 1e-9   // floating-point tolerance for token amount comparisons

  for (const [mint, txns] of Object.entries(byMint)) {
    const sorted = [...txns].sort((a, b) => a.timestamp - b.timestamp)
    const lots: Lot[] = []

    for (const tx of sorted) {
      if (tx.isBuy) {
        lots.push({
          solCost:     tx.solAmount,
          tokenAmount: tx.tokenAmount,
          timestamp:   tx.timestamp,
          source:      tx.source,
        })
        continue
      }

      // ── SELL ──────────────────────────────────────────────────────────────
      if (lots.length === 0) continue   // sell with no known buy — skip

      let remaining    = tx.tokenAmount
      let costBasis    = 0
      let firstBuyTs   = lots[0].timestamp   // ← FIX: use actual first lot ts, not sell ts

      while (remaining > EPSILON && lots.length > 0) {
        const lot = lots[0]

        if (lot.tokenAmount <= remaining + EPSILON) {
          // consume entire lot
          costBasis  += lot.solCost
          remaining  -= lot.tokenAmount
          remaining   = Math.max(0, remaining)   // clamp float rounding artefacts
          lots.shift()
        } else {
          // partial lot
          const fraction  = remaining / lot.tokenAmount
          costBasis      += lot.solCost * fraction
          lot.solCost    *= 1 - fraction
          lot.tokenAmount -= remaining
          remaining       = 0
        }
      }

      if (costBasis > 0) {
        const pnlSol = tx.solAmount - costBasis
        closedTrades.push({
          tokenMint:     mint,
          buyTimestamp:  firstBuyTs,
          sellTimestamp: tx.timestamp,
          holdMs:        Math.max(0, (tx.timestamp - firstBuyTs) * 1000),
          solCost:       costBasis,
          solReceived:   tx.solAmount,
          pnlSol,
          pnlPercent:    costBasis > 0 ? (pnlSol / costBasis) * 100 : 0,
          isWin:         pnlSol > 0,
          source:        tx.source,
        })
      }
    }

    if (lots.length > 0) openPositions[mint] = lots
  }

  return { closedTrades, openPositions }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function median(arr: number[]): number {
  if (arr.length === 0) return 0
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m]
}

function mean(arr: number[]): number {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length
}

// ── Scoring functions ─────────────────────────────────────────────────────────

// Impulse Control (0-100)
// Measures time-discipline per trade, normalised to trade count so
// high-volume traders aren't punished vs low-volume ones.
export function calcImpulseControl(trades: ClosedTrade[]): number {
  if (trades.length === 0) return 50
  const HOUR = 3_600_000

  // Per-trade score contribution [-1, +1] range
  const scores = trades.map(t => {
    const h = t.holdMs
    if (h < 15 * 60_000)       return -0.90
    if (h < HOUR)               return -0.40
    if (h < 4 * HOUR)          return -0.10
    if (h < 24 * HOUR)         return +0.20
    if (h < 7 * 24 * HOUR)    return +0.40
    return +0.60                // > 7 days
  })

  // Normalised average, mapped to 0-100
  const avg = mean(scores)  // -1 to +1
  let score = Math.round(50 + avg * 50)

  // Bonus: hold winners longer than losers
  const wins   = trades.filter(t => t.isWin)
  const losses = trades.filter(t => !t.isWin)
  if (wins.length > 1 && losses.length > 1) {
    const avgWinHold  = mean(wins.map(t => t.holdMs))
    const avgLossHold = mean(losses.map(t => t.holdMs))
    if (avgWinHold > avgLossHold * 1.2) score = Math.min(100, score + 8)
    if (avgWinHold < avgLossHold * 0.8) score = Math.max(0,   score - 8)
  }

  return Math.min(100, Math.max(0, score))
}

// Diamond Hands (0-100)
// Uses MEDIAN hold time to avoid outlier skew from one long hold.
export function calcDiamondHands(trades: ClosedTrade[]): number {
  if (trades.length === 0) return 50
  const HOUR    = 3_600_000
  const medHold = median(trades.map(t => t.holdMs))

  let score: number
  if      (medHold > 7 * 24 * HOUR) score = 95
  else if (medHold > 3 * 24 * HOUR) score = 82
  else if (medHold > 24 * HOUR)     score = 68
  else if (medHold > 4 * HOUR)      score = 54
  else if (medHold > HOUR)          score = 40
  else if (medHold > 15 * 60_000)   score = 26
  else                               score = 12

  // Bonus: majority of winning trades held > 4h
  const wins    = trades.filter(t => t.isWin)
  const longWin = wins.filter(t => t.holdMs > 4 * HOUR).length
  if (wins.length > 0 && longWin / wins.length > 0.5) score = Math.min(100, score + 8)

  return Math.min(100, Math.max(0, Math.round(score)))
}

// Win Rate Quality (0-100)
// Combines win rate with profit factor so raw win % doesn't dominate.
export function calcWinRateQuality(trades: ClosedTrade[]): number {
  if (trades.length < 3) return 50
  const wins   = trades.filter(t => t.isWin)
  const losses = trades.filter(t => !t.isWin)
  const winRate = wins.length / trades.length

  const avgWin  = wins.length   > 0 ? mean(wins.map(t => t.pnlSol))                    : 0
  const avgLoss = losses.length > 0 ? Math.abs(mean(losses.map(t => t.pnlSol)))        : 1
  const pf      = avgLoss > 0 ? avgWin / avgLoss : 1

  const wrScore = winRate * 60                       // 0–60
  const pfScore = Math.min(40, (pf - 0.5) * 20)    // 0–40
  return Math.min(100, Math.max(0, Math.round(wrScore + pfScore)))
}

// Risk Management (0-100)
// Uses coefficient of variation of position sizes.
// Lower CV = more consistent sizing = higher score.
export function calcRiskManagement(trades: ClosedTrade[]): number {
  if (trades.length < 3) return 50
  const sizes = trades.map(t => t.solCost)
  const m     = mean(sizes)
  if (m <= 0) return 50

  const std = Math.sqrt(mean(sizes.map(v => (v - m) ** 2)))
  const cv  = std / m

  // Revenge spike: any position > 4× mean suggests tilt
  const maxSize  = Math.max(...sizes)
  const tiltPenalty = maxSize > m * 4 ? -12 : maxSize > m * 3 ? -6 : 0

  const score = Math.round(Math.max(0, 90 - cv * 55)) + tiltPenalty
  return Math.min(100, Math.max(0, score))
}

// Emotional Control (0-100)
// Detects loss streaks, revenge sizing, and tilt patterns.
export function calcEmotionalControl(trades: ClosedTrade[]): number {
  if (trades.length < 5) return 55
  const sorted = [...trades].sort((a, b) => a.sellTimestamp - b.sellTimestamp)
  let score = 65

  // Max consecutive loss streak
  let streak = 0; let maxStreak = 0
  for (const t of sorted) {
    streak = t.isWin ? 0 : streak + 1
    maxStreak = Math.max(maxStreak, streak)
  }
  if (maxStreak >= 7)      score -= 22
  else if (maxStreak >= 5) score -= 14
  else if (maxStreak >= 3) score -= 6

  // Revenge sizing: position significantly larger right after a loss
  let revengeCount = 0
  for (let i = 1; i < sorted.length; i++) {
    if (!sorted[i - 1].isWin && sorted[i].solCost > sorted[i - 1].solCost * 2.5) {
      revengeCount++
    }
  }
  score -= Math.min(revengeCount * 5, 20)

  // Bonus: sustained win streak
  let wStreak = 0; let maxWStreak = 0
  for (const t of sorted) {
    wStreak = t.isWin ? wStreak + 1 : 0
    maxWStreak = Math.max(maxWStreak, wStreak)
  }
  if (maxWStreak >= 7)      score += 14
  else if (maxWStreak >= 5) score += 8
  else if (maxWStreak >= 3) score += 3

  return Math.min(100, Math.max(0, Math.round(score)))
}

// ── Chart helpers ─────────────────────────────────────────────────────────────

export interface HoldBucket { label: string; count: number; wins: number }

export function holdTimeBuckets(trades: ClosedTrade[]): HoldBucket[] {
  const HOUR = 3_600_000
  const b: HoldBucket[] = [
    { label: '< 15m',  count: 0, wins: 0 },
    { label: '15m-1h', count: 0, wins: 0 },
    { label: '1h-4h',  count: 0, wins: 0 },
    { label: '4h-24h', count: 0, wins: 0 },
    { label: '1d-7d',  count: 0, wins: 0 },
    { label: '> 7d',   count: 0, wins: 0 },
  ]
  for (const t of trades) {
    const h = t.holdMs; const w = t.isWin ? 1 : 0
    if      (h < 15 * 60_000)     { b[0].count++; b[0].wins += w }
    else if (h < HOUR)             { b[1].count++; b[1].wins += w }
    else if (h < 4 * HOUR)        { b[2].count++; b[2].wins += w }
    else if (h < 24 * HOUR)       { b[3].count++; b[3].wins += w }
    else if (h < 7 * 24 * HOUR)   { b[4].count++; b[4].wins += w }
    else                           { b[5].count++; b[5].wins += w }
  }
  return b
}

export function cumulativePnl(trades: ClosedTrade[]): Array<{ n: number; pnl: number }> {
  const sorted = [...trades].sort((a, b) => a.sellTimestamp - b.sellTimestamp)
  let running = 0
  return sorted.map((t, i) => {
    running += t.pnlSol
    return { n: i + 1, pnl: Math.round(running * 10000) / 10000 }
  })
}
