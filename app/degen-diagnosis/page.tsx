'use client'

import { useState } from 'react'
import Navbar        from '@/components/Navbar'
import Footer        from '@/components/Footer'
import LoadingState  from '@/components/mental-scan/LoadingState'
import ScoreHero     from '@/components/mental-scan/ScoreHero'
import SubScoreGrid  from '@/components/mental-scan/SubScoreGrid'
import StatsRow      from '@/components/mental-scan/StatsRow'
import { DegenRadar, HoldHistogram, CumPnlChart } from '@/components/mental-scan/Charts'
import InsightsPanel from '@/components/mental-scan/InsightsPanel'
import ShareModal    from '@/components/mental-scan/ShareModal'

type ScanResult = {
  wallet: string
  mentalDegenScore: number
  archetype: {
    name: string; icon: string; description: string; roast: string
    color: string; tier: number; percentile: string
    diagnosisCode: string; diagnosisName: string; prognosis: string
  }
  subScores: {
    impulseControl: number; diamondHands: number; winRateQuality: number
    riskManagement: number; emotionalControl: number
  }
  insights: Array<{ type: 'danger' | 'warning' | 'good' | 'info'; text: string }>
  stats: {
    totalTrades: number; openPositions: number; winRate: number
    totalPnlSol: number; avgHoldMs: number; bestTradePnl: number
    worstTradePnl: number; avgWinSol: number; avgLossSol: number
  }
  charts: {
    holdBuckets:   Array<{ label: string; count: number; wins: number }>
    cumulativePnl: Array<{ n: number; pnl: number }>
    radarData:     Array<{ metric: string; score: number }>
  }
  dataQuality: { transactionsFetched: number; swapsFound: number; closedPositions: number; skippedSwaps: number }
}

export default function DegenDiagnosisPage() {
  const [wallet,    setWallet]    = useState('')
  const [status,    setStatus]    = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result,    setResult]    = useState<ScanResult | null>(null)
  const [error,     setError]     = useState('')
  const [showShare, setShowShare] = useState(false)

  const handleScan = async () => {
    const trimmed = wallet.trim()
    if (!trimmed) return
    setStatus('loading'); setError(''); setResult(null)
    try {
      const res  = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wallet: trimmed }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Assessment failed.'); setStatus('error'); return }
      setResult(data); setStatus('done')
    } catch { setError('Network error. Please try again.'); setStatus('error') }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-20 px-4">
        <div className="max-w-4xl mx-auto">

          {/* ── Clinic Header ── */}
          <div className="text-center pt-10 pb-8">

            {/* Institution nameplate */}
            <div className="mb-6 inline-flex flex-col items-center gap-1">
              <div className="flex items-center gap-3 px-6 py-2 rounded-xl border border-neon-green/20 bg-neon-green/5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AAFF00" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2v20M2 12h20"/>
                </svg>
                <span className="text-neon-green text-xs font-bold tracking-[0.3em] uppercase">The Degen Asylum</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AAFF00" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2v20M2 12h20"/>
                </svg>
              </div>
              <span className="text-gray-600 text-xs tracking-widest uppercase">Psychiatric Assessment — Solana Division</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-wider mb-3">
              <span className="text-white">DEGEN</span>{' '}
              <span className="text-neon-green drop-shadow-[0_0_30px_rgba(170,255,0,0.5)]">DIAGNOSIS</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
              Submit your Solana wallet for a full psychiatric evaluation by <span className="text-neon-green font-semibold">Dr. H. Opium, M.D.</span> — Chief Psychologist of the Degen Asylum. Results are confidential. Diagnosis is not.
            </p>
          </div>

          {/* ── Patient Intake ── */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="mb-2">
              <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">Patient Intake</p>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={wallet}
                onChange={e => setWallet(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                placeholder="Enter patient wallet address..."
                className="flex-1 px-5 py-4 rounded-xl bg-degen-dark border border-degen-border text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 font-mono text-sm transition-colors"
                disabled={status === 'loading'}
              />
              <button
                onClick={handleScan}
                disabled={status === 'loading' || !wallet.trim()}
                className="btn-primary px-8 py-4 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Assessing...' : 'Begin Assessment'}
              </button>
            </div>

            {/* Disclaimer cards */}
            {status === 'idle' && (
              <div className="grid grid-cols-3 gap-3 mt-5 text-center">
                {[
                  { svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AAFF00" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2v20M2 12h20"/></svg>, label: 'Clinical grade data', sub: 'Helius Enhanced API' },
                  { svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AAFF00" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>, label: 'Read-only analysis', sub: 'No wallet connect' },
                  { svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AAFF00" strokeWidth="1.5" strokeLinecap="round"><path d="M9 12l2 2 4-4M12 2a10 10 0 110 20 10 10 0 010-20z"/></svg>, label: 'DSM-D certified', sub: 'By Dr. H. Opium' },
                ].map(f => (
                  <div key={f.label} className="p-3 rounded-xl border border-degen-border bg-degen-dark/40">
                    <div className="flex justify-center mb-1.5">{f.svg}</div>
                    <div className="text-white text-xs font-semibold">{f.label}</div>
                    <div className="text-gray-600 text-xs">{f.sub}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── States ── */}
          {status === 'loading' && <LoadingState wallet={wallet.trim()} />}

          {status === 'error' && (
            <div className="max-w-xl mx-auto text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl border border-neon-pink/30 bg-neon-pink/10 flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF2D78" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
              </div>
              <p className="text-neon-pink font-semibold mb-2">Assessment Failed</p>
              <p className="text-gray-400 text-sm mb-6">{error}</p>
              <button onClick={() => setStatus('idle')} className="btn-ghost px-8 py-3">Try Again</button>
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

              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <DegenRadar data={result.charts.radarData} />
                <HoldHistogram data={result.charts.holdBuckets} />
              </div>
              <CumPnlChart data={result.charts.cumulativePnl} />

              <InsightsPanel insights={result.insights} />
              <StatsRow stats={result.stats} dataQuality={result.dataQuality} />

              <div className="text-center pt-6 border-t border-degen-border">
                <button
                  onClick={() => { setStatus('idle'); setResult(null); setWallet('') }}
                  className="btn-ghost px-8 py-3"
                >
                  Assess Another Patient
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

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
