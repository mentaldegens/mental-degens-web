// Scoring engine — Degen Asylum Psychiatric Classification System
//
// Score formula:
//   Mental Health Score = IC×0.25 + DH×0.20 + WRQ×0.25 + RM×0.15 + EC×0.15
//
// Each tier carries an official DSM-D (Degen Statistical Manual of Disorders) code.

import type { ClosedTrade } from './analysis'
import {
  calcImpulseControl, calcDiamondHands, calcWinRateQuality,
  calcRiskManagement, calcEmotionalControl,
} from './analysis'

export interface SubScores {
  impulseControl:   number
  diamondHands:     number
  winRateQuality:   number
  riskManagement:   number
  emotionalControl: number
}

export interface Archetype {
  name:          string
  icon:          string
  description:   string
  roast:         string
  color:         string
  tier:          number
  percentile:    string
  diagnosisCode: string   // DSM-D code
  diagnosisName: string   // Full clinical disorder name
  prognosis:     string   // Short clinical prognosis
}

// ─────────────────────────────────────────────────────────────────────────────
// DSM-D: Degen Statistical Manual of Disorders — 12-Tier Classification
// ─────────────────────────────────────────────────────────────────────────────
const ARCHETYPES: Array<{ min: number } & Archetype> = [

  {
    min: 93, tier: 12,
    name:          'Solana God',
    icon:          'crown',
    color:         '#AAFF00',
    percentile:    'Top 1% of all patients assessed',
    diagnosisCode: 'OMDS-XII',
    diagnosisName: 'Omnipotent Market Deity Syndrome',
    description:   'Patient exhibits supernatural market awareness, zero emotional volatility, and surgical position management. Others provide patient\'s exit liquidity. Market does not move against patient — patient IS the market.',
    roast:         'The 1%. You walk on chain.',
    prognosis:     'No intervention required. Continue current behavioral patterns. Monitor for hubris.',
  },

  {
    min: 84, tier: 11,
    name:          'Phantom Trader',
    icon:          'ghost',
    color:         '#AAFF00',
    percentile:    'Top 5% of all patients assessed',
    diagnosisCode: 'HGS-XI',
    diagnosisName: 'Hyperrational Ghost Syndrome',
    description:   'Patient moves silently and surgically. Emotional response to market stimuli is clinically undetectable. Elite hold discipline, consistent position sizing, and negligible tilt episodes observed across full trading history.',
    roast:         'Elite. The market hasn\'t caught you yet.',
    prognosis:     'Excellent prognosis. Patient is in the top 5% of all cases reviewed by this clinic.',
  },

  {
    min: 75, tier: 10,
    name:          'Diamond Oracle',
    icon:          'diamond',
    color:         '#00F5FF',
    percentile:    'Top 13% of all patients assessed',
    diagnosisCode: 'DCS-X',
    diagnosisName: 'Diamond Conviction Syndrome',
    description:   'Patient demonstrates consistent patience on winning positions and decisive loss-cutting behavior. Conviction is data-driven rather than emotion-driven. Rare in the Solana patient population.',
    roast:         'Conviction over everything. Respect.',
    prognosis:     'Strong prognosis. Minor optimizations in position sizing could elevate patient to Tier 11.',
  },

  {
    min: 66, tier: 9,
    name:          'Cold Blooded',
    icon:          'eye',
    color:         '#00F5FF',
    percentile:    'Top 25% of all patients assessed',
    diagnosisCode: 'CBS-IX',
    diagnosisName: 'Cold-Blooded Speculator Syndrome',
    description:   'Patient displays minimal emotional interference in trade decision-making. Losses are cut systematically. Winners are held with discipline. Some room for improvement in consistency, but fundamentals are sound.',
    roast:         'No fear, no greed. Just execution.',
    prognosis:     'Good prognosis. Patient shows capacity for further improvement with targeted behavioral therapy.',
  },

  {
    min: 58, tier: 8,
    name:          'Street Smart',
    icon:          'shield',
    color:         '#FFD700',
    percentile:    'Top 40% of all patients assessed',
    diagnosisCode: 'SSS-VIII',
    diagnosisName: 'Street-Smart Survivor Syndrome',
    description:   'Patient has sustained significant market trauma but adapted behavioral responses accordingly. Risk management is functional. Win rate above median. Evidence of hard lessons absorbed and applied to future trade behavior.',
    roast:         'You paid the market\'s tuition. Now it shows.',
    prognosis:     'Moderate to good prognosis. Continued improvement expected with disciplined journaling and position review.',
  },

  {
    min: 49, tier: 7,
    name:          'Chaos Trader',
    icon:          'brain',
    color:         '#FFD700',
    percentile:    'Top 55% of all patients assessed',
    diagnosisCode: 'CTS-VII',
    diagnosisName: 'Chaotic Trading Syndrome',
    description:   'Patient\'s trading behavior is characterized by unpredictable decision-making patterns. Some trades show rational structure; others appear vibes-driven. Inconsistent hold times and variable position sizing suggest dual psychological states.',
    roast:         'Organized chaos. Emphasis on the chaos.',
    prognosis:     'Guarded prognosis. Patient requires behavioral consistency therapy before condition can improve.',
  },

  {
    min: 41, tier: 6,
    name:          'Hopium Addict',
    icon:          'zap',
    color:         '#FF8C00',
    percentile:    'Top 68% of all patients assessed',
    diagnosisCode: 'HAS-VI',
    diagnosisName: 'Hopium Addiction Syndrome',
    description:   'Patient exhibits chronic hope-over-data decision-making. Losing positions are held well beyond rational thresholds, fueled by persistent optimism unsupported by on-chain evidence. Patient may require mandatory Hopium detox.',
    roast:         'Still holding. Still hoping. Still losing.',
    prognosis:     'Guarded prognosis. Recommend immediate enrollment in Dr. Hopium\'s 12-Step Degen Recovery Program.',
  },

  {
    min: 33, tier: 5,
    name:          'FOMO Zombie',
    icon:          'skull',
    color:         '#FF2D78',
    percentile:    'Top 80% of all patients assessed',
    diagnosisCode: 'FZS-V',
    diagnosisName: 'FOMO Zombie Syndrome',
    description:   'Patient exhibits a predictable behavioral loop: identify pump, enter at top, panic sell at bottom. Repeat without learning. Neurological scans indicate the FOMO response fires before the rational brain can intervene.',
    roast:         'Bought the top. Sold the bottom. Every time.',
    prognosis:     'Poor prognosis without intervention. Dr. Hopium recommends mandatory cooldown periods before each trade entry.',
  },

  {
    min: 25, tier: 4,
    name:          'Paper Hand',
    icon:          'sword',
    color:         '#FF2D78',
    percentile:    'Top 88% of all patients assessed',
    diagnosisCode: 'CPED-IV',
    diagnosisName: 'Chronic Premature Exit Disorder',
    description:   'Patient systematically exits winning positions before they reach target. Simultaneously holds losing positions indefinitely. The degen inversion in its purest clinical form. Patient sold multiple 10x positions at 10%.',
    roast:         'You sold the 10x at 10%. Classic.',
    prognosis:     'Poor prognosis. Recommend cognitive restructuring therapy focused on asymmetric risk-reward tolerance.',
  },

  {
    min: 17, tier: 3,
    name:          'Tilt Machine',
    icon:          'flame',
    color:         '#B400FF',
    percentile:    'Top 93% of all patients assessed',
    diagnosisCode: 'ARTP-III',
    diagnosisName: 'Acute Revenge Trading Psychosis',
    description:   'Patient enters a recursive loss-aggression spiral following adverse market events. Each loss triggers a larger, more irrational position. Neurological evaluation suggests the concept of "stopping" is not present in patient\'s psychological framework.',
    roast:         'Loss → bigger bet → bigger loss. Repeat.',
    prognosis:     'Very poor prognosis. Immediate mandatory trading pause recommended. Dr. Hopium prescribes 72-hour chart abstinence.',
  },

  {
    min: 9, tier: 2,
    name:          'Rug Magnet',
    icon:          'crosshair',
    color:         '#B400FF',
    percentile:    'Top 97% of all patients assessed',
    diagnosisCode: 'PSAS-II',
    diagnosisName: 'Pathological Scam Attraction Syndrome',
    description:   'Patient has an extraordinary talent for selecting tokens that will subsequently rug, honeypot, or otherwise fail catastrophically. Statistical analysis of patient\'s entries suggests an inverse genius — the ability to consistently choose the worst possible outcome.',
    roast:         'If it rugs, you own it. Guaranteed.',
    prognosis:     'Extremely poor prognosis. Recommend consulting any random wallet with a higher score before every trade decision.',
  },

  {
    min: 0, tier: 1,
    name:          'Exit Liquidity',
    icon:          'target',
    color:         '#B400FF',
    percentile:    'Top 99% of all patients assessed',
    diagnosisCode: 'ELLS-I',
    diagnosisName: 'Exit Liquidity Legacy Syndrome',
    description:   'Patient serves a critical, if unintentional, function in the Solana ecosystem: providing exit liquidity for every profitable trader above them. Without patients like this, no one else could take profits. The market thanks you for your service.',
    roast:         'The market couldn\'t exist without you. Literally.',
    prognosis:     'Terminal. Dr. Hopium recommends patient invest in index funds and step away from the terminal permanently.',
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
    if (score >= a.min) {
      return {
        name: a.name, icon: a.icon, description: a.description,
        roast: a.roast, color: a.color, tier: a.tier,
        percentile: a.percentile, diagnosisCode: a.diagnosisCode,
        diagnosisName: a.diagnosisName, prognosis: a.prognosis,
      }
    }
  }
  return { ...ARCHETYPES[ARCHETYPES.length - 1] }
}

export interface Insight {
  type: 'danger' | 'warning' | 'good' | 'info'
  text: string
}

export function generateInsights(trades: ClosedTrade[], sub: SubScores, score: number): Insight[] {
  const insights: Insight[] = []
  const wins   = trades.filter(t => t.isWin)
  const losses = trades.filter(t => !t.isWin)
  const winRate     = trades.length > 0 ? (wins.length / trades.length) * 100 : 0
  const HOUR        = 3_600_000
  const avgWinHold  = wins.length   > 0 ? wins.reduce((s,t)   => s + t.holdMs, 0) / wins.length   : 0
  const avgLossHold = losses.length > 0 ? losses.reduce((s,t) => s + t.holdMs, 0) / losses.length : 0
  const avgWinPnl   = wins.length   > 0 ? wins.reduce((s,t)   => s + t.pnlSol,  0) / wins.length  : 0
  const avgLossPnl  = losses.length > 0 ? losses.reduce((s,t) => s + t.pnlSol,  0) / losses.length : 0
  const flash       = trades.filter(t => t.holdMs < 15 * 60_000)

  if (sub.impulseControl < 30)
    insights.push({ type: 'danger', text: `${flash.length} positions closed in under 15 minutes. Clinical observation: patient is exhibiting acute panic response. Entries are irrelevant if exits are driven by fear rather than logic.` })
  else if (sub.impulseControl < 50)
    insights.push({ type: 'warning', text: `${flash.length} premature exits detected. Patient is leaving significant gains unrealised. Positions require more time to develop before closing.` })
  else if (sub.impulseControl >= 75)
    insights.push({ type: 'good', text: `Impulse control is above clinical threshold. Patient demonstrates the rare ability to hold positions through volatility without capitulating.` })

  if (wins.length > 2 && losses.length > 2) {
    if (avgWinHold < avgLossHold * 0.7)
      insights.push({ type: 'warning', text: `Patient holds losing positions ${(avgLossHold/HOUR).toFixed(1)}h on average, but closes winners after only ${(avgWinHold/HOUR).toFixed(1)}h. Textbook degen inversion — cutting winners, riding losers into the void.` })
    else if (avgWinHold > avgLossHold * 1.4)
      insights.push({ type: 'good', text: `Patient holds winners ${(avgWinHold/avgLossHold).toFixed(1)}× longer than losers. This asymmetric hold behavior is the foundation of long-term account growth.` })
  }

  if (winRate < 30)
    insights.push({ type: 'danger', text: `${winRate.toFixed(0)}% win rate classified as clinically deficient. Patient loses 7 in 10 trades. Immediate entry criteria review required.` })
  else if (winRate < 40)
    insights.push({ type: 'warning', text: `${winRate.toFixed(0)}% win rate is below the population median. Patient\'s profit factor must compensate — winners must significantly outsize losers.` })
  else if (winRate >= 65)
    insights.push({ type: 'good', text: `${winRate.toFixed(0)}% win rate exceeds the 90th percentile of this clinic\'s patient population. Statistically significant outperformance observed.` })

  if (wins.length > 0 && losses.length > 0 && avgLossPnl !== 0) {
    const pf = Math.abs(avgWinPnl / avgLossPnl)
    if (pf < 0.7)
      insights.push({ type: 'danger', text: `Average loss (${Math.abs(avgLossPnl).toFixed(3)} SOL) is ${(1/pf).toFixed(1)}× the average win. Patient requires a >60% win rate simply to break even. This is not a viable long-term configuration.` })
    else if (pf >= 2.0)
      insights.push({ type: 'good', text: `Profit factor of ${pf.toFixed(1)}× — clinical excellence. Patient\'s winners are dramatically larger than losers. This asymmetry is the compounding engine most patients never unlock.` })
  }

  if (sub.riskManagement < 30)
    insights.push({ type: 'danger', text: `Severe position sizing disorder detected. Patient allocates capital based on emotional state rather than systematic criteria. This is the primary cause of account destruction in the Solana patient population.` })
  else if (sub.riskManagement < 45)
    insights.push({ type: 'warning', text: `Inconsistent position sizing. Dr. Hopium prescribes a fixed unit size protocol — same bet regardless of conviction bias.` })

  if (sub.emotionalControl < 30)
    insights.push({ type: 'danger', text: `Acute revenge trading psychosis confirmed. Patient increases position size following losses in a maladaptive attempt to recover. This behavior is the fastest documented path to account liquidation.` })
  else if (sub.emotionalControl < 45)
    insights.push({ type: 'warning', text: `Mild tilt episodes detected in patient history. Dr. Hopium prescribes mandatory 30-minute cooling periods following any losing streak of 3 or more.` })

  if (score >= 84)
    insights.push({ type: 'info', text: `Overall assessment: patient demonstrates behavioral discipline exceeding 95% of this clinic\'s population. The psychological edge is measurable and statistically significant.` })
  else if (score < 25)
    insights.push({ type: 'danger', text: `Prognosis: patient\'s primary adversary is not the market — it is their own psychological response to market stimuli. Dr. Hopium recommends process-first treatment before any increase in position size.` })

  return insights.slice(0, 5)
}
