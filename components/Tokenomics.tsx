const cards = [
  { icon: '📈', label: 'Total Supply',      value: 'TBA',    color: 'text-neon-green',  desc: 'The total supply will be announced alongside the official token launch. Details to follow.' },
  { icon: '🔥', label: 'Team Allocation',   value: '0%',     color: 'text-neon-pink',   desc: 'No team tokens. No insider bags. This is a community token, full stop.' },
  { icon: '👑', label: 'Community',         value: '100%',   color: 'text-neon-cyan',   desc: 'Every token in existence belongs to the community. That\'s the whole point.' },
  { icon: '🎁', label: 'Tax',               value: 'TBA',    color: 'text-neon-purple', desc: 'Tax structure and utility details will be revealed in the near future. Stay tuned.' },
  { icon: '🔗', label: 'Blockchain',        value: 'Solana', color: 'text-yellow-400',  desc: 'Built on Solana for fast, low-cost transactions. Because degens don\'t have time to wait.' },
  { icon: '🎯', label: 'Utility',           value: 'TBA',    color: 'text-neon-green',  desc: 'Token utility and ecosystem integrations will be announced progressively as we build.' },
]

export default function Tokenomics() {
  return (
    <section id="tokenomics" className="relative py-24 lg:py-36 bg-degen-dark">
      <div className="section-glow right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-eyebrow">$MDGN Token</p>
          <h2 className="section-title">Toke<span className="text-neon-green">nomics</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto mt-4">
            $MDGN begins its journey as a pure community token — no VC bags, no insider allocations, no bullshit.
          </p>
        </div>

        {/* Community notice */}
        <div className="max-w-3xl mx-auto mb-14">
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-neon-green/30 bg-neon-green/5">
            <span className="text-neon-green text-2xl mt-0.5">⚠</span>
            <div>
              <p className="text-neon-green font-semibold mb-1">Community Token — Early Stage</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                $MDGN currently exists as a community-driven token. Final tokenomics, supply details, and distribution specifics will be announced as the project matures. All decisions will be made transparently with the community.
              </p>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {cards.map(c => (
            <div key={c.label} className="token-card">
              <div className={`token-card-icon ${c.color}`}>{c.icon}</div>
              <h3 className="font-display text-xl tracking-wider text-white mb-1">{c.label}</h3>
              <p className={`text-3xl font-bold ${c.color} mb-2`}>{c.value}</p>
              <p className="text-gray-400 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 text-xs max-w-2xl mx-auto">
          $MDGN is a community token. This is not financial advice. Degen responsibly. Always DYOR.
        </p>
      </div>
    </section>
  )
}
