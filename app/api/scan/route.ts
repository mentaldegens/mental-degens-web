import { NextRequest, NextResponse } from 'next/server'
import { fetchSwaps } from '@/lib/helius'
import { reconstructTrades, holdTimeBuckets, cumulativePnl } from '@/lib/analysis'
import { calcSubScores, calcFinalScore, getArchetype, generateInsights } from '@/lib/scoring'

// Simple in-memory cache — avoids hammering Helius for the same wallet
const cache = new Map<string, { data: unknown; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000  // 5 minutes

export async function POST(req: NextRequest) {
  try {
    const { wallet } = await req.json() as { wallet: string }

    if (!wallet || wallet.length < 32 || wallet.length > 44) {
      return NextResponse.json({ error: 'Invalid wallet address.' }, { status: 400 })
    }

    const apiKey = process.env.HELIUS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Helius API key not configured.' }, { status: 500 })
    }

    // cache hit?
    const cached = cache.get(wallet)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // 1. Fetch raw swaps from Helius
    const { swaps, totalFetched } = await fetchSwaps(wallet, apiKey)

    if (swaps.length === 0) {
      return NextResponse.json({
        error: 'No swap transactions found for this wallet. Make sure it has traded on Solana DEXes.',
      }, { status: 404 })
    }

    // 2. Reconstruct positions → closed trades
    const { closedTrades, openPositions } = reconstructTrades(swaps)

    if (closedTrades.length < 3) {
      const openCount = Object.keys(openPositions).length
      return NextResponse.json({
        error: openCount > 0
          ? `Found ${swaps.length} swaps but only ${closedTrades.length} closed position(s). This wallet has ${openCount} open position(s) that haven't been sold yet. Mental Scan needs at least 3 completed buy→sell cycles. Try a wallet with more trading history.`
          : `Only ${closedTrades.length} closed trade(s) found. Need at least 3 completed buy→sell cycles. Try a wallet that has been actively trading for longer.`,
      }, { status: 422 })
    }

    // 3. Calculate metrics & scores
    const subScores   = calcSubScores(closedTrades)
    const finalScore  = calcFinalScore(subScores)
    const archetype   = getArchetype(finalScore)
    const insights    = generateInsights(closedTrades, subScores, finalScore)

    // 4. Summary stats
    const wins      = closedTrades.filter(t => t.isWin)
    const losses    = closedTrades.filter(t => !t.isWin)
    const totalPnl  = closedTrades.reduce((s, t) => s + t.pnlSol, 0)
    const avgHoldMs = closedTrades.reduce((s, t) => s + t.holdMs, 0) / closedTrades.length
    const bestTrade = closedTrades.reduce((best, t) => t.pnlSol > best.pnlSol ? t : best, closedTrades[0])
    const worstTrade = closedTrades.reduce((worst, t) => t.pnlSol < worst.pnlSol ? t : worst, closedTrades[0])

    const result = {
      wallet,
      mentalDegenScore: finalScore,
      archetype,
      subScores,
      insights,
      stats: {
        totalTrades:   closedTrades.length,
        openPositions: Object.keys(openPositions).length,
        winRate:       Math.round((wins.length / closedTrades.length) * 100),
        totalPnlSol:   Math.round(totalPnl * 1000) / 1000,
        avgHoldMs:     Math.round(avgHoldMs),
        bestTradePnl:  Math.round(bestTrade.pnlSol * 1000) / 1000,
        worstTradePnl: Math.round(worstTrade.pnlSol * 1000) / 1000,
        avgWinSol:     wins.length   > 0 ? Math.round(wins.reduce((s, t)   => s + t.pnlSol, 0) / wins.length   * 1000) / 1000 : 0,
        avgLossSol:    losses.length > 0 ? Math.round(losses.reduce((s, t) => s + t.pnlSol, 0) / losses.length * 1000) / 1000 : 0,
      },
      charts: {
        holdBuckets:   holdTimeBuckets(closedTrades),
        cumulativePnl: cumulativePnl(closedTrades),
        radarData: [
          { metric: 'Impulse\nControl',    score: subScores.impulseControl   },
          { metric: 'Diamond\nHands',      score: subScores.diamondHands     },
          { metric: 'Win Rate\nQuality',   score: subScores.winRateQuality   },
          { metric: 'Risk\nMgmt',          score: subScores.riskManagement   },
          { metric: 'Emotional\nControl',  score: subScores.emotionalControl },
        ],
      },
      dataQuality: {
        transactionsFetched: totalFetched,
        swapsFound:          swaps.length,
        closedPositions:     closedTrades.length,
      },
    }

    cache.set(wallet, { data: result, ts: Date.now() })
    return NextResponse.json(result)

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
