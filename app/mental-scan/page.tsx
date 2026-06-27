import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Mental Scan | Mental Degens',
  description: 'Scan your wallet and discover your Degen Archetype. Deep on-chain behavioral analysis for Solana traders.',
}

export default function MentalScanPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">

          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-green/30 bg-neon-green/5 text-neon-green text-sm font-semibold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            Coming Soon
          </div>

          <h1 className="font-display text-6xl sm:text-8xl tracking-wider mb-4">
            <span className="text-white">MENTAL</span><br />
            <span className="text-neon-green drop-shadow-[0_0_40px_rgba(170,255,0,0.6)]">SCAN</span>
          </h1>

          <p className="text-gray-300 text-lg mb-4">
            Paste your Solana wallet. We&apos;ll analyze thousands of your on-chain trades and tell you exactly what kind of degen you really are.
          </p>
          <p className="text-gray-500 text-sm mb-10">
            Behavioral psychology. Real on-chain data. Zero mercy.
          </p>

          {/* Teaser metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {['Impulse Control', 'Diamond Hands Score', 'FOMO Index', 'Degen Archetype'].map(m => (
              <div key={m} className="p-4 rounded-xl border border-degen-border bg-degen-dark/60">
                <div className="w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green/20 mb-3 mx-auto" />
                <p className="text-xs text-gray-500 uppercase tracking-wider">{m}</p>
              </div>
            ))}
          </div>

          {/* Notify input */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Your Solana wallet address"
              className="flex-1 px-4 py-3 rounded-lg bg-degen-dark border border-degen-border text-gray-300 placeholder-gray-600 focus:outline-none focus:border-neon-green/50 text-sm"
            />
            <button className="btn-primary px-6 py-3 whitespace-nowrap">
              Notify Me
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-3">
            We&apos;ll alert you the moment Mental Scan goes live.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
