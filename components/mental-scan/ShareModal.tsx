'use client'
import { useRef, useState } from 'react'

interface Props {
  score: number
  archetype: {
    name: string; icon: string; color: string; tier: number
    roast: string; percentile: string; diagnosisCode: string; diagnosisName: string
  }
  wallet: string
  stats: { winRate: number; totalPnlSol: number; totalTrades: number }
  subScores: { impulseControl: number; diamondHands: number; winRateQuality: number; riskManagement: number; emotionalControl: number }
  onClose: () => void
}

const ICON_PATHS: Record<string, string> = {
  crown:     'M2 19h20M3 19l2-9 4.5 4L12 5l2.5 9L19 10l2 9',
  ghost:     'M9 10h.01M15 10h.01M12 2a8 8 0 00-8 8v10l3-3 3 3 3-3 3 3 3-3V10a8 8 0 00-8-8z',
  diamond:   'M6 3h12l4 6-10 12L2 9z M2 9h20M12 3l4 6-4 12-4-12z',
  eye:       'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z',
  shield:    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
  brain:     'M9.5 2A2.5 2.5 0 007 4.5v0A2.5 2.5 0 004.5 7v0A2.5 2.5 0 002 9.5v1A2.5 2.5 0 004.5 13v0A2.5 2.5 0 007 15.5v0A2.5 2.5 0 009.5 18h1A2.5 2.5 0 0013 15.5v0A2.5 2.5 0 0015.5 13v0A2.5 2.5 0 0018 10.5v-1A2.5 2.5 0 0015.5 7v0A2.5 2.5 0 0013 4.5v0A2.5 2.5 0 0010.5 2h-1z',
  zap:       'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  skull:     'M12 2C7.03 2 3 6.03 3 11c0 2.93 1.4 5.54 3.57 7.2V20a1 1 0 001 1h1v1h6v-1h1a1 1 0 001-1v-1.8C18.6 16.54 20 13.93 20 11c0-4.97-4.03-9-8-9z M10 17h4M12 17v2',
  sword:     'M14.5 17.5L3 6 3 3 6 3 17.5 14.5 M13 19l6-6 M16 16l4 4 M19 21l2-2',
  flame:     'M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-7 7 7 7 0 01-7-7c0-1.53.4-2.973 1-4a2.5 2.5 0 002.5 2.5z',
  crosshair: 'M12 2a10 10 0 100 20A10 10 0 0012 2z M22 12h-4M6 12H2M12 6V2M12 22v-4',
  target:    'M12 2a10 10 0 100 20A10 10 0 0012 2z M12 6a6 6 0 100 12A6 6 0 0012 6z',
}

function ScoreBar({ val, color }: { val: number; color: string }) {
  return (
    <div style={{ height: 3, borderRadius: 2, background: '#1E1E1E', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${val}%`, background: color }} />
    </div>
  )
}

export default function ShareModal({ score, archetype, wallet, stats, subScores, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy]   = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const pnlPos  = stats.totalPnlSol >= 0
  const iconPath = ICON_PATHS[archetype.icon] ?? ICON_PATHS.skull
  const caseNum  = `DA-${wallet.slice(0, 4).toUpperCase()}-${score.toString().padStart(3, '0')}`
  const today    = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const handleDownload = async () => {
    if (!cardRef.current) return
    setBusy(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5, backgroundColor: '#050505', useCORS: true, logging: false,
      })
      const link = document.createElement('a')
      link.download = `degen-diagnosis-${caseNum}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally { setBusy(false) }
  }

  const shareText =
    `Degen Asylum — Patient Report\n\n` +
    `Score: ${score}/100 | ${archetype.name}\n` +
    `Diagnosis: ${archetype.diagnosisCode}\n` +
    `"${archetype.roast}"\n\n` +
    `Get diagnosed → mentaldegens.xyz/degen-diagnosis\n\n` +
    `#MentalDegens #DegenDiagnosis #MDGN #Solana`

  // Web Share API on mobile — far more reliable than target="_blank" in modals
  const handleShareX = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: shareText })
        return
      } catch {
        // user cancelled — fall through to URL approach
      }
    }
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const c = archetype.color

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-lg">

        {/* Close */}
        <div className="flex justify-end mb-3">
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── PATIENT REPORT CARD ── */}
        <div
          ref={cardRef}
          style={{
            background: '#07070A',
            border: `1px solid ${c}20`,
            borderRadius: 12,
            fontFamily: 'Space Grotesk, system-ui, sans-serif',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Top accent line */}
          <div style={{ height: 3, background: `linear-gradient(90deg, ${c}, ${c}00)` }} />

          {/* Subtle background glow */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: c + '06', filter: 'blur(60px)', pointerEvents: 'none' }} />

          <div style={{ padding: '24px 28px' }}>

            {/* ── LETTERHEAD ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ color: '#AAFF00', fontSize: 13, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                  THE DEGEN ASYLUM
                </div>
                <div style={{ color: '#4b5563', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
                  Psychiatric Patient Portfolio · Solana Division
                </div>
              </div>
              {/* Cross icon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.6 }}>
                <path d="M12 2v20M2 12h20"/>
              </svg>
            </div>

            {/* ── CASE INFO BAR ── */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20, gap: 12,
            }}>
              {[
                { label: 'Case No.', val: caseNum },
                { label: 'Patient ID', val: `${wallet.slice(0,6)}...${wallet.slice(-6)}` },
                { label: 'Assessment Date', val: today },
                { label: 'Attending', val: 'Dr. H. Opium, M.D.' },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ color: '#4b5563', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{f.label}</div>
                  <div style={{ color: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }}>{f.val}</div>
                </div>
              ))}
            </div>

            {/* ── DIAGNOSIS ROW ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>

              {/* Score circle */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle cx="45" cy="45" r="38" fill="none" stroke={c} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - score / 100)}`}
                    style={{ filter: `drop-shadow(0 0 8px ${c})` }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: c, fontSize: 24, fontWeight: 800, lineHeight: 1, fontFamily: 'Impact, sans-serif' }}>{score}</span>
                  <span style={{ color: '#6b7280', fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>score</span>
                </div>
              </div>

              {/* Diagnosis block */}
              <div style={{ flex: 1 }}>
                {/* Tier badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: c + '10', border: `1px solid ${c}30`,
                  borderRadius: 99, padding: '3px 10px', marginBottom: 8,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round">
                    {iconPath.split(' M').map((seg, i) => (
                      <path key={i} d={i === 0 ? seg : 'M' + seg} />
                    ))}
                  </svg>
                  <span style={{ color: c, fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    Tier {archetype.tier}/12 — {archetype.percentile}
                  </span>
                </div>

                {/* Archetype name */}
                <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, fontFamily: 'Impact, sans-serif', letterSpacing: 2, textTransform: 'uppercase', lineHeight: 1, marginBottom: 6 }}>
                  {archetype.name}
                </div>

                {/* Diagnosis code */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: c, fontSize: 11, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em' }}>
                    {archetype.diagnosisCode}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: 10 }}>
                    {archetype.diagnosisName}
                  </span>
                </div>
              </div>
            </div>

            {/* Roast */}
            <div style={{
              borderLeft: `2px solid ${c}`,
              paddingLeft: 12, marginBottom: 18,
              color: c, fontSize: 11, fontStyle: 'italic',
            }}>
              &ldquo;{archetype.roast}&rdquo;
            </div>

            {/* ── DIAGNOSTIC AXES ── */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ color: '#4b5563', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10 }}>
                DSM-D Five-Axis Psychiatric Assessment
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                {[
                  { label: 'Impulse Control',   val: subScores.impulseControl   },
                  { label: 'Diamond Hands',      val: subScores.diamondHands     },
                  { label: 'Win Rate Quality',   val: subScores.winRateQuality   },
                  { label: 'Risk Management',    val: subScores.riskManagement   },
                  { label: 'Emotional Control',  val: subScores.emotionalControl },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#6b7280', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
                      <span style={{ color: '#9ca3af', fontSize: 9, fontWeight: 700 }}>{s.val}/100</span>
                    </div>
                    <ScoreBar val={s.val} color={s.val >= 55 ? '#AAFF00' : s.val >= 35 ? '#FFD700' : '#FF2D78'} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── PATIENT METRICS ── */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: 12,
            }}>
              {[
                { label: 'Win Rate',  val: `${stats.winRate}%`, color: undefined },
                { label: 'Total P&L', val: `${pnlPos ? '+' : ''}${stats.totalPnlSol.toFixed(3)} SOL`, color: pnlPos ? '#AAFF00' : '#FF2D78' },
                { label: 'Trades',   val: stats.totalTrades.toString(), color: undefined },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ color: s.color ?? '#fff', fontSize: 16, fontWeight: 800, lineHeight: 1, marginBottom: 3 }}>{s.val}</div>
                  <div style={{ color: '#6b7280', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── DR. HOPIUM SIGNATURE ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {/* Dr. Hopium avatar */}
              {!imgErr ? (
                <img
                  src="/IMG/dr-hopium-pfp.png"
                  alt="Dr. H. Opium"
                  onError={() => setImgErr(true)}
                  style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${c}30`, objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${c}30`, background: c + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: c, fontSize: 14, fontWeight: 800 }}>H</span>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>Dr. H. Opium, M.D. (Maximum Degen)</div>
                <div style={{ color: '#6b7280', fontSize: 9, marginTop: 1 }}>Chief Psychiatrist · The Degen Asylum</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#4b5563', fontSize: 9 }}>mentaldegens.xyz</div>
                <div style={{ color: '#4b5563', fontSize: 8, marginTop: 1 }}>#MentalDegens</div>
              </div>
            </div>

          </div>

          {/* Bottom accent */}
          <div style={{ height: 2, background: `linear-gradient(90deg, ${c}00, ${c}60, ${c}00)` }} />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDownload}
            disabled={busy}
            className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
          >
            {busy
              ? <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.22-8.56"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            }
            Download Report
          </button>
          <button
            onClick={handleShareX}
            className="btn-ghost flex-1 py-3 flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share Diagnosis
          </button>
        </div>
      </div>
    </div>
  )
}
