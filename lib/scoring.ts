// Score aggregation + Degen Archetype engine

import type { ClosedTrade } from './analysis'
import {
  calcImpulseControl,
  calcDiamondHands,
  calcWinRateQuality,
  calcRiskManagement,
  calcEmotionalControl,
} from './analysis'

export interface SubScores {
  impulseControl: number    // 25%
  diamondHands: number      // 20%
  winRateQuality: number    // 25%
  riskManagement: number    // 15%
  emotionalControl: number  // 15%
}

export interface Archetype {
  name: string
  emoji: string
  description: string
  color: string   // neon hex
}

const ARCHETYPES: Array<{ min: number } & Archetype> = [
  {
    min: 90,
    name: 'Calculated Phantom',
    emoji: '👻',
    description: 'You move in silence. Surgical precision, zero emotion. The market doesn\'t scare you — you ARE the market.',
    color: '#AAFF00',
  },
  {
    min: 78,
    name: 'Diamond Oracle',
    emoji: '💎',
    description: 'Patient, disciplined, and somehow always early. You see through the noise and hold conviction like it\'s religion.',
    color: '#00F5FF',
  },
  {
    min: 65,
    name: 'Methodical Degen',
    emoji: '🧠',
    description: 'You\'ve got the framework. Sometimes emotion sneaks in, but your bones are built right. Keep forging.',
    color: '#AAFF00',
  },
  {
    min: 52,
    name: 'FOMO Alchemist',
    emoji: '⚗️',
    description: 'You chase entries but somehow turn chaos into occasional gold. A little more patience and you\'re dangerous.',
    color: '#FF2D78',
  },
  {
    min: 40,
    name: 'Chaotic Neutral Degen',
    emoji: '🎲',
    description: 'Pure vibes. No strategy, no fear, no plan — yet somehow still breathing. The market respects chaos.',
    color: '#B400FF',
  },
  {
    min: 28,
    name: 'Paper Hand Phantom',
    emoji: '🧻',
    description: 'You exit winners too fast and hold losers too long. Classic degen inversion. Time to rewire the brain.',
    color: '#FF2D78',
  },
  {
    min: 15,
    name: 'Emotional Apex Predator',
    emoji: '🦁',
    description: 'Pure emotion drives every trade. Rage buys, panic sells, revenge entries. You\'re not trading — you\'re feeling.',
    color: '#FF2D78',
  },
  {
    min: 0,
    name: 'Degen Sacrifice',
    emoji: '🔥',
    description: 'The exit liquidity. Every rug finds you. Every pump dumps on you. But you\'re still here — respect.',
    color: '#FF2D78',
  },
]

export function calcSubScores(trades: ClosedTrade[]): SubScores {
  return {
    impulseControl:   calcImpulseControl(trades),
    diamondHands:     calcDiamondHands(trades),
    winRateQuality:   calcWinRateQuality(trades),
    riskManagement:   calcRiskManagement(trades),
    emotionalControl: calcEmotionalControl(trades),
  }
}

export function calcFinalScore(sub: SubScores): number {
  return Math.round(
    sub.impulseControl   * 0.25 +
    sub.diamondHands     * 0.20 +
    sub.winRateQuality   * 0.25 +
    sub.riskManagement   * 0.15 +
    sub.emotionalControl * 0.15,
  )
}

export function getArchetype(score: number): Archetype {
  for (const a of ARCHETYPES) {
    if (score >= a.min) return { name: a.name, emoji: a.emoji, description: a.description, color: a.color }
  }
  return ARCHETYPES[ARCHETYPES.length - 1]
}

export function generateInsights(trades: ClosedTrade[], sub: SubScores, score: number): string[] {
  const insights: string[] = []
  const wins   = trades.filter(t => t.isWin)
  const losses = trades.filter(t => !t.isWin)
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0
  const HOUR   = 3_600_000

  const avgWinHold  = wins.length   > 0 ? wins.reduce((s, t)   => s + t.holdMs, 0) / wins.length   : 0
  const avgLossHold = losses.length > 0 ? losses.reduce((s, t) => s + t.holdMs, 0) / losses.length : 0

  const avgWinPnl  = wins.length   > 0 ? wins.reduce((s, t)   => s + t.pnlSol, 0) / wins.length   : 0
  const avgLossPnl = losses.length > 0 ? losses.reduce((s, t) => s + t.pnlSol, 0) / losses.length : 0

  const flashTrades = trades.filter(t => t.holdMs < 15 * 60_000)

  // Impulse
  if (sub.impulseControl < 35) {
    insights.push(`🚨 ${flashTrades.length} trades closed in under 15 minutes. That's not trading — that's panic. Your best entry is worthless if you exit before the trade plays out.`)
  } else if (sub.impulseControl > 75) {
    insights.push(`✅ Your hold time discipline is elite. You give trades room to breathe — a rare trait in degen land.`)
  }

  // Diamond hands
  if (avgWinHold < avgLossHold && wins.length > 2 && losses.length > 2) {
    insights.push(`⚠️ You hold losers ${Math.round(avgLossHold / HOUR)}h on average but only hold winners for ${Math.round(avgWinHold / HOUR)}h. Classic degen inversion. Let your winners run.`)
  } else if (avgWinHold > avgLossHold * 1.5) {
    insights.push(`💎 You hold winners ${Math.round(avgWinHold / avgLossHold)}x longer than losers. That's elite risk asymmetry — exactly how pros compound.`)
  }

  // Win rate
  if (winRate < 35) {
    insights.push(`📉 ${winRate.toFixed(0)}% win rate. You're losing more often than not. Either sharpen your entries or tighten your stop logic.`)
  } else if (winRate > 65) {
    insights.push(`🎯 ${winRate.toFixed(0)}% win rate is legitimately impressive. Most degens can't hold this above 50%.`)
  }

  // Profit factor
  if (wins.length > 0 && losses.length > 0) {
    const pf = Math.abs(avgWinPnl / avgLossPnl)
    if (pf < 0.8) {
      insights.push(`🔴 Your average loss (${Math.abs(avgLossPnl).toFixed(3)} SOL) is bigger than your average win (${avgWinPnl.toFixed(3)} SOL). Win rate alone won't save you here.`)
    } else if (pf > 2) {
      insights.push(`🟢 Profit factor of ${pf.toFixed(1)}x — your winners are significantly bigger than your losers. This is how accounts grow.`)
    }
  }

  // Risk management
  if (sub.riskManagement < 35) {
    insights.push(`⚠️ Wild position sizing detected. Inconsistent bet sizes are a sign of emotional decision-making. Pick a position size and stick to it.`)
  }

  // Emotional control
  if (sub.emotionalControl < 40) {
    insights.push(`🧠 Revenge trading signals detected in your history. After a loss, step away. The market will still be there when you're clear-headed.`)
  }

  // Overall
  if (score >= 80) {
    insights.push(`🏆 Overall you trade with more discipline than 90% of the wallets we've scanned. The mental edge is real.`)
  } else if (score < 35) {
    insights.push(`🛑 Your biggest enemy isn't the market — it's your own psychology. Work on process before size.`)
  }

  return insights.slice(0, 5)
}
