import { NextRequest, NextResponse } from 'next/server'
import { fetchSwaps } from '@/lib/helius'
import { reconstructTrades, holdTimeBuckets, cumulativePnl } from '@/lib/analysis'
import { calcSubScores, calcFinalScore, getArchetype, generateInsights } from '@/lib/scoring'

// Note: in-memory cache is not used on Netlify serverless (context is ephemeral).
// Response caching is handled at the CDN/edge layer via Cache-Control headers.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { wallet?: string }
    const wallet = (body.wallet ?? '').trim()

    if (!wallet || wallet.length < 32 || wallet.length > 44) {
      return NextResponse.json({ error: 'Invalid wallet address.' }, { status: 400 })
    }

    const apiKey = process.env.HELIUS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
    }

    // Fetch raw swaps from Helius (up to 2 000 transactions)
    const { swaps, totalFetched, skipped } = await fetchSwaps(wallet, apiKey)

    if (swaps.length === 0) {
      return NextResponse.json({
        error: 'No swap transactions found for this wallet. Make sure it has traded on Solana DEXes (Jupiter, Raydium, Pump.fun, etc.).',
      }, { status: 404 })
    }

    // Reconstruct closed positions via FIFO
    const { closedTrades, openPositions } = reconstructTrades(swaps)

    if (closedTrades.length < 3) {
      const openCount = Object.keys(openPositions).length
      const msg = openCount > 0
        ? `Found ${swaps.length} swaps but only ${closedTrades.length} closed position(s). This wallet has ${openCount} open position(s) that haven't been sold yet. Degen Diagnosis requires at least 3 completed buy→sell cycles to generate a patient report.`
        : `Only ${closedTrades.length} closed trade(s) found. Degen Diagnosis requires at least 3 completed buy→sell cycles. Dr. H. Opium needs more data to make a proper diagnosis.`
      return NextResponse.json({ error: msg }, { status: 422 })
    }

    // Compute scores
    const subScores  = calcSubScores(closedTrades)
    const finalScore = calcFinalScore(subScores)
    const archetype  = getArchetype(finalScore)
    const insights   = generateInsights(closedTrades, subScores, finalScore)

    // Summary stats
    const wins  = closedTrades.filter(t => t.isWin)
    const losses = closedTrades.filter(t => !t.isWin)
    const totalPnl = closedTrades.reduce((s, t) => s + t.pnlSol, 0)
    const avgHoldMs = closedTrades.reduce((s, t) => s + t.holdMs, 0) / closedTrades.length
    const best  = closedTrades.reduce((b, t) => t.pnlSol > b.pnlSol ? t : b, closedTrades[0])
    const worst = closedTrades.reduce((b, t) => t.pnlSol < b.pnlSol ? t : b, closedTrades[0])

    const round = (n: number, d = 4) => Math.round(n * 10 ** d) / 10 ** d

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
        totalPnlSol:   round(totalPnl),
        avgHoldMs:     Math.round(avgHoldMs),
        bestTradePnl:  round(best.pnlSol),
        worstTradePnl: round(worst.pnlSol),
        avgWinSol:     wins.length   > 0 ? round(wins.reduce((s, t)   => s + t.pnlSol, 0) / wins.length)   : 0,
        avgLossSol:    losses.length > 0 ? round(losses.reduce((s, t) => s + t.pnlSol, 0) / losses.length) : 0,
      },
      charts: {
        holdBuckets:   holdTimeBuckets(closedTrades),
        cumulativePnl: cumulativePnl(closedTrades),
        radarData: [
          { metric: 'Impulse\nControl',   score: subScores.impulseControl   },
          { metric: 'Diamond\nHands',     score: subScores.diamondHands     },
          { metric: 'Win Rate\nQuality',  score: subScores.winRateQuality   },
          { metric: 'Risk\nMgmt',         score: subScores.riskManagement   },
          { metric: 'Emotional\nControl', score: subScores.emotionalControl },
        ],
      },
      dataQuality: {
        transactionsFetched: totalFetched,
        swapsFound:          swaps.length,
        closedPositions:     closedTrades.length,
        skippedSwaps:        skipped,
      },
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
