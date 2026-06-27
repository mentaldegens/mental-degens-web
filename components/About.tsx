const values = [
  { icon: '☠️', label: 'Degen Mindset',  desc: 'We embrace risk. We own our decisions. Zero excuses.',       color: 'neon-green',  mt: false },
  { icon: '💎', label: 'Diamond Hands',  desc: 'We hold what we believe in. Conviction over fear.',         color: 'neon-pink',   mt: true  },
  { icon: '💉', label: 'Hopium Fuel',    desc: 'We stay bullish when others fold. Hope is our edge.',       color: 'neon-cyan',   mt: false },
  { icon: '🏗️', label: 'Build Together', desc: 'Community first. Always. We build, we win together.',      color: 'neon-purple', mt: true  },
]

const colorMap: Record<string, string> = {
  'neon-green':  'border-[#AAFF00]/20 hover:border-[#AAFF00]/60 text-[#AAFF00]',
  'neon-pink':   'border-[#FF2D78]/20 hover:border-[#FF2D78]/60 text-[#FF2D78]',
  'neon-cyan':   'border-[#00F5FF]/20 hover:border-[#00F5FF]/60 text-[#00F5FF]',
  'neon-purple': 'border-[#B400FF]/20 hover:border-[#B400FF]/60 text-[#B400FF]',
}

export default function About() {
  return (
    <section id="about" className="relative py-24 lg:py-36">
      <div className="section-glow left" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-eyebrow">Who We Are</p>
          <h2 className="section-title">The <span className="text-neon-pink">Story</span></h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              Mental Degens wasn&apos;t born in a boardroom. It was born at 3 AM, somewhere between a rug pull and a 10x, when a group of unhinged Solana natives decided to stop chasing alpha and start{' '}
              <span className="text-neon-green font-semibold">building it</span>.
            </p>
            <p>
              We are the ones who laugh when the market bleeds. The ones who average down when everyone else paper-hands. The ones who mint at the top, flip at the bottom, and somehow still come out ahead — because we move as one.
            </p>
            <p>
              This isn&apos;t just a token. It&apos;s a{' '}
              <span className="text-neon-pink font-semibold">mindset</span>. Mental Degens is a community of builders, traders, artists, and believers who understand that the greatest opportunities always look stupid at first.
            </p>
            <p>
              <span className="text-neon-green font-semibold">MDGN</span> is the symbol of that conviction. A community token, owned and driven by the people who dare to be degen in a world that wants them to play it safe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="https://x.com/MentalDegen" target="_blank" rel="noopener noreferrer" className="btn-primary">
                Follow on X
              </a>
            </div>
          </div>

          {/* Values grid */}
          <div className="grid grid-cols-2 gap-4">
            {values.map(v => (
              <div
                key={v.label}
                className={`value-card ${colorMap[v.color]} ${v.mt ? 'mt-6' : ''}`}
              >
                <span className={`value-icon ${colorMap[v.color].split(' ')[2]}`}>{v.icon}</span>
                <h3 className="font-display text-2xl text-white tracking-wider">{v.label}</h3>
                <p className="text-gray-400 text-sm mt-1">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
