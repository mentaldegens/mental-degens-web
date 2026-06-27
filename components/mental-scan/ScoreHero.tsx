'use client'
import { useEffect, useRef, useState } from 'react'
import {
  GhostIcon, DiamondIcon, BrainIcon, ZapIcon, CrosshairIcon,
  SkullIcon, FlameIcon, TargetIcon, CrownIcon, ShieldIcon, EyeIcon, SwordIcon,
} from '@/components/Icons'

const ARCHETYPE_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  crown: CrownIcon, ghost: GhostIcon, diamond: DiamondIcon, eye: EyeIcon,
  shield: ShieldIcon, brain: BrainIcon, zap: ZapIcon, skull: SkullIcon,
  sword: SwordIcon, flame: FlameIcon, crosshair: CrosshairIcon, target: TargetIcon,
}

interface Props {
  score: number
  archetype: {
    name: string; icon: string; description: string; roast: string
    color: string; tier: number; percentile: string
    diagnosisCode: string; diagnosisName: string; prognosis: string
  }
  wallet: string
  onShare: () => void
}

export default function ScoreHero({ score, archetype, wallet, onShare }: Props) {
  const [displayed, setDisplayed] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    const duration = 1400
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setDisplayed(Math.round((1 - Math.pow(1 - p, 3)) * score))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [score])

  const ArchetypeIcon = ARCHETYPE_ICONS[archetype.icon] ?? SkullIcon

  return (
    <div className="mb-12">

      {/* Clinical header banner */}
      <div className="mb-8 p-4 rounded-xl border border-degen-border bg-degen-dark/80 text-center">
        <p className="text-neon-green text-xs font-bold tracking-[0.3em] uppercase mb-1">
          The Degen Asylum — Psychiatric Patient Portfolio
        </p>
        <p className="text-gray-500 text-xs font-mono">
          Case ID: {wallet.slice(0, 8)}...{wallet.slice(-8)} &nbsp;·&nbsp; Attending: Dr. H. Opium, M.D.
        </p>
      </div>

      <div className="text-center">
        {/* Tier + percentile badge */}
        <div
          className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase"
          style={{ borderColor: archetype.color + '40', color: archetype.color, background: archetype.color + '10' }}
        >
          Tier {archetype.tier} / 12 — {archetype.percentile}
        </div>

        {/* Score ring */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <svg width="220" height="220" className="-rotate-90">
            <circle cx="110" cy="110" r="96" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle
              cx="110" cy="110" r="96" fill="none"
              stroke={archetype.color} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 96}`}
              strokeDashoffset={`${2 * Math.PI * 96 * (1 - displayed / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 16px ${archetype.color}90)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display leading-none" style={{ color: archetype.color, fontSize: '5rem' }}>
              {displayed}
            </span>
            <span className="text-gray-500 text-xs tracking-widest uppercase mt-1">Mental Health Score</span>
          </div>
        </div>

        {/* Archetype icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center border"
            style={{ borderColor: archetype.color + '35', backgroundColor: archetype.color + '12' }}
          >
            <ArchetypeIcon size={32} color={archetype.color} />
          </div>
        </div>

        {/* Archetype name */}
        <h2 className="font-display text-4xl lg:text-5xl tracking-wider text-white mb-2 uppercase">
          {archetype.name}
        </h2>

        {/* Diagnosis code + name */}
        <div className="inline-flex flex-col items-center gap-1 mb-4">
          <span
            className="font-mono text-sm font-bold tracking-wider px-3 py-1 rounded border"
            style={{ color: archetype.color, borderColor: archetype.color + '40', background: archetype.color + '08' }}
          >
            {archetype.diagnosisCode}
          </span>
          <span className="text-gray-400 text-xs tracking-wide">{archetype.diagnosisName}</span>
        </div>

        {/* Roast */}
        <p className="text-sm font-semibold italic mb-4" style={{ color: archetype.color }}>
          &ldquo;{archetype.roast}&rdquo;
        </p>

        {/* Clinical description */}
        <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed mb-4">
          {archetype.description}
        </p>

        {/* Prognosis */}
        <div className="max-w-xl mx-auto mb-6 p-3 rounded-lg border border-degen-border bg-degen-dark/60">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">Prognosis</p>
          <p className="text-gray-300 text-sm">{archetype.prognosis}</p>
        </div>

        {/* Wallet + share */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-degen-border bg-degen-dark text-gray-500 text-xs font-mono mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
          {wallet.slice(0, 6)}...{wallet.slice(-8)}
        </div>

        <div className="flex justify-center">
          <button onClick={onShare} className="btn-primary px-8 py-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
            </svg>
            Share Patient Report
          </button>
        </div>
      </div>
    </div>
  )
}
