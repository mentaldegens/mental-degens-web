'use client'

import { useRef, useState } from 'react'

interface Props {
  score: number
  archetype: { name: string; emoji: string; color: string }
  wallet: string
  stats: { winRate: number; totalPnlSol: number; totalTrades: number }
  subScores: { impulseControl: number; diamondHands: number; winRateQuality: number; riskManagement: number; emotionalControl: number }
  onClose: () => void
}

export default function ShareModal({ score, archetype, wallet, stats, subScores, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#050505',
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `mental-degen-score-${wallet.slice(0, 8)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  const shareText = `My Mental Degen Score: ${score}/100 — ${archetype.emoji} ${archetype.name}\n\nScanned on mentaldegens.xyz\n\n#MentalDegens #MDGN #Solana`

  const pnlPositive = stats.totalPnlSol >= 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg">

        {/* Close */}
        <div className="flex justify-end mb-3">
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* THE CARD — this is what gets screenshotted */}
        <div
          ref={cardRef}
          style={{
            background: 'linear-gradient(135deg, #050505 0%, #0A0A0A 50%, #050505 100%)',
            border: `1px solid ${archetype.color}30`,
            borderRadius: 16,
            padding: 32,
            fontFamily: 'Space Grotesk, system-ui, sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background glow */}
          <div style={{
            position: 'absolute', top: -80, right: -80, width: 300, height: 300,
            borderRadius: '50%', background: archetype.color + '08', filter: 'blur(60px)',
            pointerEvents: 'none',
          }} />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div style={{ color: '#AAFF00', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>
                Mental Degens
              </div>
              <div style={{ color: '#4b5563', fontSize: 11, fontFamily: 'monospace' }}>
                {wallet.slice(0, 6)}...{wallet.slice(-6)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#4b5563', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mental Scan</div>
            </div>
          </div>

          {/* Score + Archetype */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1, color: archetype.color, fontFamily: 'Impact, sans-serif' }}>
                {score}
              </div>
              <div style={{ color: '#6b7280', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}>/100</div>
            </div>
            <div>
              <div style={{ fontSize: 32 }}>{archetype.emoji}</div>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, fontFamily: 'Impact, sans-serif', letterSpacing: 2, textTransform: 'uppercase', lineHeight: 1.1 }}>
                {archetype.name}
              </div>
            </div>
          </div>

          {/* Sub-scores bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 24 }}>
            {[
              { label: 'Impulse', val: subScores.impulseControl },
              { label: 'Diamond', val: subScores.diamondHands },
              { label: 'Win Rate', val: subScores.winRateQuality },
              { label: 'Risk', val: subScores.riskManagement },
              { label: 'Emotion', val: subScores.emotionalControl },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{s.val}</div>
                <div style={{ height: 3, borderRadius: 2, background: '#1E1E1E', marginBottom: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.val}%`, background: archetype.color, borderRadius: 2 }} />
                </div>
                <div style={{ color: '#6b7280', fontSize: 9, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Win Rate',    value: `${stats.winRate}%` },
              { label: 'Total P&L',  value: `${pnlPositive ? '+' : ''}${stats.totalPnlSol.toFixed(3)} SOL`, color: pnlPositive ? '#AAFF00' : '#FF2D78' },
              { label: 'Trades',     value: stats.totalTrades.toString() },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: s.color ?? '#fff', fontSize: 18, fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                <div style={{ color: '#6b7280', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ color: '#4b5563', fontSize: 10, letterSpacing: '0.1em' }}>mentaldegens.xyz</div>
            <div style={{ color: '#4b5563', fontSize: 10 }}>#MentalDegens #MDGN #Solana</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                Download PNG
              </>
            )}
          </button>
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost flex-1 py-3 flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share on X
          </a>
        </div>
      </div>
    </div>
  )
}
