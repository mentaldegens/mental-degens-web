'use client'
import { useRef, useState } from 'react'

interface Props {
  score: number
  archetype: { name: string; icon: string; color: string }
  wallet: string
  stats: { winRate: number; totalPnlSol: number; totalTrades: number }
  subScores: { impulseControl: number; diamondHands: number; winRateQuality: number; riskManagement: number; emotionalControl: number }
  onClose: () => void
}

// Inline SVG paths for the share card (no component imports — html2canvas needs inline SVG)
const ICON_PATHS: Record<string, string> = {
  ghost:     'M9 10h.01M15 10h.01M12 2a8 8 0 00-8 8v10l3-3 3 3 3-3 3 3 3-3V10a8 8 0 00-8-8z',
  diamond:   'M6 3h12l4 6-10 12L2 9z M2 9h20M12 3l4 6-4 12-4-12z',
  brain:     'M9.5 2A2.5 2.5 0 007 4.5v0A2.5 2.5 0 004.5 7v0A2.5 2.5 0 002 9.5v1A2.5 2.5 0 004.5 13v0A2.5 2.5 0 007 15.5v0A2.5 2.5 0 009.5 18h1A2.5 2.5 0 0013 15.5v0A2.5 2.5 0 0015.5 13v0A2.5 2.5 0 0018 10.5v-1A2.5 2.5 0 0015.5 7v0A2.5 2.5 0 0013 4.5v0A2.5 2.5 0 0010.5 2h-1z M9 8h1M14 8h1M9 13h6',
  zap:       'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  crosshair: 'M12 2a10 10 0 100 20A10 10 0 0012 2z M22 12h-4M6 12H2M12 6V2M12 22v-4',
  skull:     'M12 2C7.03 2 3 6.03 3 11c0 2.93 1.4 5.54 3.57 7.2V20a1 1 0 001 1h1v1h6v-1h1a1 1 0 001-1v-1.8C18.6 16.54 20 13.93 20 11c0-4.97-4.03-9-8-9z M10 17h4M12 17v2',
  flame:     'M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-7 7 7 7 0 01-7-7c0-1.53.4-2.973 1-4a2.5 2.5 0 002.5 2.5z',
  target:    'M12 2a10 10 0 100 20A10 10 0 0012 2z M12 6a6 6 0 100 12A6 6 0 0012 6z',
  crown:     'M2 19h20M3 19l2-9 4.5 4L12 5l2.5 9L19 10l2 9',
}

export default function ShareModal({ score, archetype, wallet, stats, subScores, onClose }: Props) {
  const cardRef    = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const pnlPos = stats.totalPnlSol >= 0
  const iconPath = ICON_PATHS[archetype.icon] ?? ICON_PATHS.skull

  const handleDownload = async () => {
    if (!cardRef.current) return
    setBusy(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#050505', useCORS: true, logging: false })
      const link = document.createElement('a')
      link.download = `mdgn-score-${wallet.slice(0, 8)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally { setBusy(false) }
  }

  const shareText = `My Mental Degen Score: ${score}/100 — ${archetype.name}\n\nScanned on mentaldegens.xyz\n\n#MentalDegens #MDGN #Solana`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg">
        <div className="flex justify-end mb-3">
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* CARD */}
        <div
          ref={cardRef}
          style={{ background: 'linear-gradient(135deg,#050505 0%,#0A0A0A 50%,#050505 100%)', border: `1px solid ${archetype.color}25`, borderRadius: 16, padding: 32, fontFamily: 'Space Grotesk,system-ui,sans-serif', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background: archetype.color+'08', filter:'blur(60px)', pointerEvents:'none' }} />

          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
            <div>
              <div style={{ color:'#AAFF00', fontSize:11, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:4 }}>Mental Degens</div>
              <div style={{ color:'#4b5563', fontSize:11, fontFamily:'monospace' }}>{wallet.slice(0,6)}...{wallet.slice(-6)}</div>
            </div>
            <div style={{ color:'#4b5563', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase' }}>Mental Scan</div>
          </div>

          {/* Score + Archetype */}
          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24 }}>
            <div style={{ textAlign:'center', minWidth:80 }}>
              <div style={{ fontSize:64, fontWeight:700, lineHeight:1, color:archetype.color, fontFamily:'Impact,sans-serif' }}>{score}</div>
              <div style={{ color:'#6b7280', fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase' }}>/100</div>
            </div>
            <div>
              {/* Icon box */}
              <div style={{ width:44, height:44, borderRadius:10, border:`1px solid ${archetype.color}30`, background:`${archetype.color}10`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={archetype.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {iconPath.split(' M').map((seg, i) => (
                    <path key={i} d={i === 0 ? seg : 'M' + seg} />
                  ))}
                </svg>
              </div>
              <div style={{ color:'#fff', fontSize:20, fontWeight:700, fontFamily:'Impact,sans-serif', letterSpacing:2, textTransform:'uppercase', lineHeight:1.1 }}>{archetype.name}</div>
            </div>
          </div>

          {/* Sub-scores */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:24 }}>
            {[
              { label:'Impulse',  val:subScores.impulseControl },
              { label:'Diamond',  val:subScores.diamondHands },
              { label:'Win Rate', val:subScores.winRateQuality },
              { label:'Risk',     val:subScores.riskManagement },
              { label:'Emotion',  val:subScores.emotionalControl },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ color:'#fff', fontSize:16, fontWeight:700, marginBottom:4 }}>{s.val}</div>
                <div style={{ height:3, borderRadius:2, background:'#1E1E1E', marginBottom:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${s.val}%`, background:archetype.color }} />
                </div>
                <div style={{ color:'#6b7280', fontSize:9, letterSpacing:'0.05em', textTransform:'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            {[
              { label:'Win Rate',  value:`${stats.winRate}%`, color: undefined },
              { label:'Total P&L', value:`${pnlPos ? '+' : ''}${stats.totalPnlSol.toFixed(3)} SOL`, color: pnlPos ? '#AAFF00' : '#FF2D78' },
              { label:'Trades',    value: stats.totalTrades.toString(), color: undefined },
            ].map(s => (
              <div key={s.label} style={{ background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'10px 12px', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color:s.color ?? '#fff', fontSize:18, fontWeight:700, lineHeight:1, marginBottom:4 }}>{s.value}</div>
                <div style={{ color:'#6b7280', fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ color:'#4b5563', fontSize:10, letterSpacing:'0.1em' }}>mentaldegens.xyz</div>
            <div style={{ color:'#4b5563', fontSize:10 }}>#MentalDegens #MDGN #Solana</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button onClick={handleDownload} disabled={busy} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
            {busy
              ? <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.22-8.56"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            }
            Download PNG
          </button>
          <a
            href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank" rel="noopener noreferrer"
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
