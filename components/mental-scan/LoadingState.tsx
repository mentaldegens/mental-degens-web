'use client'
import { useEffect, useState } from 'react'

const STEPS = [
  'Connecting to Solana...',
  'Fetching transaction history...',
  'Parsing DEX swaps...',
  'Reconstructing positions (FIFO)...',
  'Calculating realized P&L...',
  'Analysing hold time patterns...',
  'Detecting emotional triggers...',
  'Computing behavioral scores...',
  'Determining your Degen Archetype...',
  'Almost there...',
]

export default function LoadingState({ wallet }: { wallet: string }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setStep(s => (s < STEPS.length - 1 ? s + 1 : s))
    }, 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Spinner */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-neon-green/20" />
        <div className="absolute inset-0 rounded-full border-t-2 border-neon-green animate-spin" />
        <div className="absolute inset-2 rounded-full border-t-2 border-neon-pink animate-spin [animation-duration:1.5s]" />
        <div className="absolute inset-4 rounded-full border-t-2 border-neon-cyan animate-spin [animation-duration:2s]" />
      </div>

      <p className="text-gray-500 text-xs font-mono mb-3 tracking-wider">
        {wallet.slice(0, 6)}...{wallet.slice(-6)}
      </p>

      <p className="text-neon-green font-semibold text-lg mb-2 transition-all duration-500">
        {STEPS[step]}
      </p>

      <div className="flex gap-1 mt-4">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i <= step ? 'bg-neon-green w-3' : 'bg-gray-700 w-1.5'
            }`}
          />
        ))}
      </div>

      <p className="text-gray-600 text-xs mt-6 max-w-xs">
        Analysing your on-chain history. This usually takes 10–30 seconds depending on trade volume.
      </p>
    </div>
  )
}
