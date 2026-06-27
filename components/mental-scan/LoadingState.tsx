'use client'
import { useEffect, useState } from 'react'

const STEPS = [
  'Accessing patient records...',
  'Retrieving on-chain behavioral history...',
  'Parsing trade-by-trade psychological data...',
  'Reconstructing emotional decision patterns...',
  'Analysing impulse control indicators...',
  'Measuring hold time asymmetry...',
  'Detecting revenge trading episodes...',
  'Calculating position sizing consistency...',
  'Consulting Dr. H. Opium...',
  'Preparing psychiatric portfolio...',
  'Signing patient diagnosis...',
]

export default function LoadingState({ wallet }: { wallet: string }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep(s => s < STEPS.length - 1 ? s + 1 : s), 1700)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">

      {/* Clinic cross spinner */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-neon-green/10" />
        <div className="absolute inset-0 rounded-full border-t-2 border-neon-green animate-spin" />
        <div className="absolute inset-2 rounded-full border-t-2 border-neon-pink animate-spin [animation-duration:1.5s]" />
        <div className="absolute inset-4 rounded-full border-t-2 border-neon-cyan animate-spin [animation-duration:2.2s]" />
        {/* Cross in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#AAFF00" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2v20M2 12h20"/>
          </svg>
        </div>
      </div>

      {/* Institution header */}
      <p className="text-neon-green text-xs font-bold tracking-[0.3em] uppercase mb-1">
        The Degen Asylum
      </p>
      <p className="text-gray-600 text-xs tracking-widest mb-6">
        Patient intake — {wallet.slice(0, 6)}...{wallet.slice(-6)}
      </p>

      {/* Step */}
      <p className="text-white font-semibold text-lg mb-2 transition-all duration-500">
        {STEPS[step]}
      </p>
      <p className="text-gray-600 text-xs mb-6">
        Dr. H. Opium is reviewing your case. This may take 15–30 seconds.
      </p>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i <= step ? 12 : 6,
              background: i <= step ? '#AAFF00' : '#1E1E1E',
            }}
          />
        ))}
      </div>
    </div>
  )
}
