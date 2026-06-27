import type { Insight } from '@/lib/scoring'
import { AlertIcon, ShieldIcon, LightningIcon, EyeIcon } from '@/components/Icons'

const typeConfig = {
  danger:  { Icon: AlertIcon,     color: '#FF2D78', bg: 'bg-[#FF2D78]/5',  border: 'border-[#FF2D78]/20',   label: 'Critical Finding'   },
  warning: { Icon: LightningIcon, color: '#FFD700', bg: 'bg-yellow-400/5', border: 'border-yellow-400/20',  label: 'Clinical Warning'   },
  good:    { Icon: ShieldIcon,    color: '#AAFF00', bg: 'bg-neon-green/5', border: 'border-neon-green/20',  label: 'Positive Indicator' },
  info:    { Icon: EyeIcon,       color: '#00F5FF', bg: 'bg-neon-cyan/5',  border: 'border-neon-cyan/20',   label: 'Clinical Note'      },
}

export default function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="mb-10">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div>
          <h3 className="font-display text-2xl tracking-wider text-white">
            Clinical <span className="text-neon-pink">Observations</span>
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">Compiled by Dr. H. Opium, M.D. — The Degen Asylum</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => {
          const cfg = typeConfig[insight.type]
          return (
            <div
              key={i}
              className={`p-4 rounded-xl border ${cfg.border} ${cfg.bg}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <cfg.Icon size={16} color={cfg.color} />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: cfg.color }}>
                    {cfg.label}
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">{insight.text}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Dr. signature line */}
      <div className="mt-4 pt-4 border-t border-degen-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center flex-shrink-0">
          <span className="text-neon-green text-xs font-bold">H</span>
        </div>
        <p className="text-gray-600 text-xs">
          Observations certified by <span className="text-gray-400">Dr. H. Opium, M.D. (Maximum Degen)</span> — Chief Psychiatrist, The Degen Asylum, Solana Division
        </p>
      </div>
    </div>
  )
}
