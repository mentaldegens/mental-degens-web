'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  score: number
  archetype: { name: string; emoji: string; description: string; color: string }
  wallet: string
  onShare: () => void
}

export default function ScoreHero({ score, archetype, wallet, onShare }: Props) {
  const [displayed, setDisplayed] = useState(0)
  const ref = useRef<number>(0)

  // Animated counter
  useEffect(() => {
    const duration = 1200
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      const val = Math.round(eased * score)
      setDisplayed(val)
      if (p < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [score])

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#AAFF00'
    if (s >= 60) return '#00F5FF'
    if (s >= 40) return '#FF2D78'
    return '#B400FF'
  }

  const color = getScoreColor(score)

  return (
    <div className="text-center mb-12">
      {/* Score ring */}
      <div className="relative inline-flex items-center justify-center mb-6">
        <svg width="200" height="200" className="-rotate-90">
          <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="100" cy="100" r="88"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - displayed / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 12px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-7xl leading-none" style={{ color }}>{displayed}</span>
          <span className="text-gray-400 text-xs tracking-widest uppercase mt-1">Mental Score</span>
        </div>
      </div>

      {/* Archetype */}
      <div className="mb-2 text-5xl">{archetype.emoji}</div>
      <h2 className="font-display text-4xl lg:text-5xl tracking-wider text-white mb-3">
        {archetype.name}
      </h2>
      <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed mb-6">
        {archetype.description}
      </p>

      {/* Wallet tag */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-degen-border bg-degen-dark text-gray-500 text-xs font-mono mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
        {wallet.slice(0, 6)}...{wallet.slice(-8)}
      </div>

      {/* Share button */}
      <div className="flex justify-center">
        <button
          onClick={onShare}
          className="btn-primary px-8 py-3 flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
          Share My Score
        </button>
      </div>
    </div>
  )
}
