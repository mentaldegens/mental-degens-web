'use client'
import { useEffect, useRef, useState } from 'react'
import { GhostIcon, DiamondIcon, BrainIcon, ZapIcon, CrosshairIcon, SkullIcon, FlameIcon, TargetIcon, CrownIcon } from '@/components/Icons'

const ARCHETYPE_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  ghost:     GhostIcon,
  diamond:   DiamondIcon,
  brain:     BrainIcon,
  zap:       ZapIcon,
  crosshair: CrosshairIcon,
  skull:     SkullIcon,
  flame:     FlameIcon,
  target:    TargetIcon,
  crown:     CrownIcon,
}

interface Props {
  score: number
  archetype: { name: string; icon: string; description: string; color: string }
  wallet: string
  onShare: () => void
}

export default function ScoreHero({ score, archetype, wallet, onShare }: Props) {
  const [displayed, setDisplayed] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    const duration = 1200
    const start = performance.now()
    const tick = (now: number) => {
      const p     = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayed(Math.round(eased * score))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [score])

  const ArchetypeIcon = ARCHETYPE_ICONS[archetype.icon] ?? SkullIcon

  return (
    <div className="text-center mb-12">
      {/* Score ring */}
      <div className="relative inline-flex items-center justify-center mb-8">
        <svg width="200" height="200" className="-rotate-90">
          <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="100" cy="100" r="88" fill="none"
            stroke={archetype.color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - displayed / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 12px ${archetype.color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-7xl leading-none" style={{ color: archetype.color }}>{displayed}</span>
          <span className="text-gray-500 text-xs tracking-widest uppercase mt-1">Mental Score</span>
        </div>
      </div>

      {/* Archetype icon */}
      <div className="flex justify-center mb-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center border"
          style={{ borderColor: archetype.color + '30', backgroundColor: archetype.color + '10' }}
        >
          <ArchetypeIcon size={32} color={archetype.color} />
        </div>
      </div>

      <h2 className="font-display text-4xl lg:text-5xl tracking-wider text-white mb-3">
        {archetype.name}
      </h2>
      <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed mb-6">
        {archetype.description}
      </p>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-degen-border bg-degen-dark text-gray-500 text-xs font-mono mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
        {wallet.slice(0, 6)}...{wallet.slice(-8)}
      </div>

      <div className="flex justify-center">
        <button onClick={onShare} className="btn-primary px-8 py-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
          Share My Score
        </button>
      </div>
    </div>
  )
}
