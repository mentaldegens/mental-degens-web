export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">

      {/* Header image */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/IMG/header.png"
          alt="Mental Degens"
          className="w-full h-full object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Scanlines */}
      <div className="absolute inset-0 z-[1] pointer-events-none scanlines" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6">

        <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-green/30 bg-neon-green/5 text-neon-green text-sm font-semibold tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          Built on Solana
        </div>

        <h1 className="font-display text-6xl sm:text-8xl lg:text-[10rem] leading-none tracking-wider mb-4">
          <span className="text-white">MENTAL</span><br />
          <span className="text-neon-green drop-shadow-[0_0_40px_rgba(170,255,0,0.6)]">DEGENS</span>
        </h1>

        <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto mb-3 font-medium">
          No risk. No reward. No mercy.
        </p>
        <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-10">
          The most unhinged community on Solana. Diamond hands, degen minds, and zero chill.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="https://t.me/MentalDegens" target="_blank" rel="noopener noreferrer"
             className="btn-primary text-lg px-10 py-4">
            Join the Cult
          </a>
          <a href="https://x.com/MentalDegen" target="_blank" rel="noopener noreferrer"
             className="btn-ghost text-lg px-10 py-4">
            Follow on X
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="stat-chip">
            <span className="stat-value">100%</span>
            <span className="stat-label">Community</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">0%</span>
            <span className="stat-label">Team Tokens</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">∞</span>
            <span className="stat-label">Degen Energy</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-gray-500 text-xs tracking-widest uppercase animate-bounce">
        <span>Scroll</span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <path d="M8 0v20M1 13l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </section>
  )
}
