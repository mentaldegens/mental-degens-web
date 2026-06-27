'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoadingState from '@/components/mental-scan/LoadingState'
import ScoreHero from '@/components/mental-scan/ScoreHero'
import SubScoreGrid from '@/components/mental-scan/SubScoreGrid'
import StatsRow from '@/components/mental-scan/StatsRow'
import { DegenRadar, HoldHistogram, CumPnlChart } from '@/components/mental-scan/Charts'
import InsightsPanel from '@/components/mental-scan/InsightsPanel'
import ShareModal from '@/components/mental-scan/ShareModal'

type ScanResult = {
  wallet: string
  mentalDegenScore: number
  archetype: { name: string; emoji: string; description: string; color: string }
  subScores: {
    impulseControl: number
    diamondHands: number
    winRateQuality: number
    riskManagement: number
    emotionalControl: number
  }
  insights: string[]
  stats: {
    totalTrades: number
    openPositions: number
    winRate: number
    totalPnlSol: number
    avgHoldMs: number
    bestTradePnl: number
    worstTradePnl: number
    avgWinSol: number
    avgLossSol: number
  }
  charts: {
    holdBuckets: Array<{ label: string; count: number; wins: number }>
    cumulativePnl: Array<{ n: number; pnl: number }>
    radarData: Array<{ metric: string; score: number }>
  }
  dataQuality: { transactionsFetched: number; swapsFound: number; closedPositions: number }
}

export default function MentalScanPage() {
  const [wallet, setWallet] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [showShare, setShowShare] = useState(false)

  const handleScan = async () => {
    const trimmed = wallet.trim()
    if (!trimmed) return
    setStatus('loading')
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        setStatus('error')
        return
      }
      setResult(data)
      setStatus('done')
    } catch {
      setError('Network error. Please try again.')
      setStatus('error')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleScan()
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-20 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          {/* ── Header ── */}
          <div className="text-center pt-12 pb-10">
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-green/30 bg-neon-green/5 text-neon-green text-sm font-semibold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              Mental Scan — Solana
            </div>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-wider mb-4">
              <span className="text-white">DEGEN</span>{' '}
              <span className="text-neon-green drop-shadow-[0_0_30px_rgba(170,255,0,0.5)]">MIND</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">
              Paste your Solana wallet. We&apos;ll tear through your on-chain history and tell you exactly what kind of degen you are — no mercy.
            </p>
          </div>

          {/* ── Input ── */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex gap-3">
              <input
                type="text"
                value={wallet}
                onChange={e => setWallet(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste Solana wallet address..."
                className="flex-1 px-5 py-4 rounded-xl bg-degen-dark border border-degen-border text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 font-mono text-sm transition-colors"
                disabled={status === 'loading'}
              />
              <button
                onClick={handleScan}
                disabled={status === 'loading' || !wallet.trim()}
                className="btn-primary px-8 py-4 text-base whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Scanning...' : 'Scan'}
              </button>
            </div>

            {/* Features */}
            {status === 'idle' && (
              <div className="grid grid-cols-3 gap-3 mt-6 text-center">
                {[
                  { icon: '🔍', label: 'Real on-chain data', sub: 'Helius Enhanced API' },
                  { icon: '🧮', label: 'FIFO reconstruction', sub: 'Professional grade' },
                  { icon: '🔒', label: 'Read-only analysis', sub: 'No wallet connect needed' },
                ].map(f => (
                  <div key={f.label} className="p-3 rounded-xl border border-degen-border bg-degen-dark/40">
                    <div className="text-xl mb-1">{f.icon}</div>
                    <div className="text-white text-xs font-semibold">{f.label}</div>
                    <div className="text-gray-600 text-xs">{f.sub}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Loading ── */}
          {status === 'loading' && <LoadingState wallet={wallet.trim()} />}

          {/* ── Error ── */}
          {status === 'error' && (
            <div className="max-w-xl mx-auto text-center py-12">
              <div className="text-4xl mb-4">😵</div>
              <p className="text-neon-pink font-semibold mb-2">Scan failed</p>
              <p className="text-gray-400 text-sm mb-6">{error}</p>
              <button onClick={() => setStatus('idle')} className="btn-ghost px-8 py-3">
                Try Again
              </button>
            </div>
          )}

          {/* ── Results ── */}
          {status === 'done' && result && (
            <div>
              <ScoreHero
                score={result.mentalDegenScore}
                archetype={result.archetype}
                wallet={result.wallet}
                onShare={() => setShowShare(true)}
              />

              <SubScoreGrid scores={result.subScores} />

              {/* Charts row */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <DegenRadar data={result.charts.radarData} />
                <HoldHistogram data={result.charts.holdBuckets} />
              </div>

              <CumPnlChart data={result.charts.cumulativePnl} />

              <InsightsPanel insights={result.insights} />

              <StatsRow stats={result.stats} dataQuality={result.dataQuality} />

              {/* Scan another */}
              <div className="text-center pt-6 border-t border-degen-border">
                <button
                  onClick={() => { setStatus('idle'); setResult(null); setWallet('') }}
                  className="btn-ghost px-8 py-3"
                >
                  Scan Another Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Share modal */}
      {showShare && result && (
        <ShareModal
          score={result.mentalDegenScore}
          archetype={result.archetype}
          wallet={result.wallet}
          stats={result.stats}
          subScores={result.subScores}
          onClose={() => setShowShare(false)}
        />
      )}

      <Footer />
    </>
  )
}
