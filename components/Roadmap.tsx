const phases = [
  {
    num: '01', label: 'Genesis', color: 'neon-green', hex: '#AAFF00', glow: 'rgba(170,255,0,0.6)',
    status: 'active', reverse: false,
    items: ['Community formation on X (Twitter)', 'Brand identity & visual assets launch', 'Website & socials go live', 'First 1,000 cult members'],
  },
  {
    num: '02', label: 'Token Launch', color: 'neon-pink', hex: '#FF2D78', glow: 'rgba(255,45,120,0.6)',
    status: 'upcoming', reverse: true,
    items: ['$MDGN token deployment on Solana', 'Fair launch — community first', 'Liquidity pool establishment', 'DEX listing (Raydium / Jupiter)'],
  },
  {
    num: '03', label: 'Community Growth', color: 'neon-cyan', hex: '#00F5FF', glow: 'rgba(0,245,255,0.6)',
    status: 'upcoming', reverse: false,
    items: ['Holder rewards & community airdrops', 'Strategic partnerships', 'CEX listing pursuit', 'Merch drop for top holders'],
  },
  {
    num: '04', label: 'Ecosystem Expansion', color: 'neon-purple', hex: '#B400FF', glow: 'rgba(180,0,255,0.6)',
    status: 'upcoming', reverse: true,
    items: ['Mental Degens DAO — community governance', 'NFT collection for OG holders', 'Ecosystem utility reveal', 'Details to be announced in the near future'],
  },
]

export default function Roadmap() {
  return (
    <section id="roadmap" className="relative py-24 lg:py-36">
      <div className="section-glow left" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-eyebrow">The Plan</p>
          <h2 className="section-title">Road<span className="text-neon-pink">map</span></h2>
          <p className="text-gray-400 max-w-xl mx-auto mt-4">
            We move with intention. Here&apos;s where we&apos;re headed — no fluff, no promises we can&apos;t keep.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-neon-green via-neon-pink to-neon-purple opacity-30 lg:-translate-x-px" />

          <div className="space-y-12">
            {phases.map(p => (
              <div
                key={p.num}
                className={`roadmap-item ${p.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}
              >
                <div className={`roadmap-content ${p.reverse ? 'lg:text-left lg:pl-12' : 'lg:text-right lg:pr-12'}`}>
                  <div
                    className="phase-badge"
                    style={{ color: p.hex, borderColor: `${p.hex}4D`, backgroundColor: `${p.hex}0D` }}
                  >
                    Phase {p.num}
                  </div>
                  <h3 className="roadmap-title">{p.label}</h3>
                  <ul className="roadmap-list">
                    {p.items.map(item => <li key={item}>{item}</li>)}
                  </ul>
                  <div className={`phase-status ${p.status === 'active' ? 'status-active' : 'status-upcoming'}`}>
                    {p.status === 'active' ? 'In Progress' : 'Upcoming'}
                  </div>
                </div>
                <div
                  className="roadmap-node"
                  style={{ backgroundColor: p.hex, boxShadow: `0 0 20px ${p.glow}` }}
                />
                <div className="roadmap-spacer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
