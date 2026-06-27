export default function CTABanner() {
  return (
    <section className="relative py-24 bg-degen-dark overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 via-transparent to-neon-pink/5" />
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10">
        <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-wider mb-6">
          <span className="text-white">STAY</span> <span className="text-neon-green">DEGEN.</span><br />
          <span className="text-white">BUILD</span> <span className="text-neon-pink">BULLISH.</span>
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          The cult is growing. Are you early, or are you watching from the sidelines?
        </p>
        <a
          href="https://t.me/MentalDegens"
          target="_blank" rel="noopener noreferrer"
          className="btn-primary text-xl px-12 py-5 inline-block"
        >
          Join the Cult →
        </a>
      </div>
    </section>
  )
}
