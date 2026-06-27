import type { Insight } from '@/lib/scoring'
import { AlertIcon, ShieldIcon, TrendUpIcon, LightningIcon, EyeIcon } from '@/components/Icons'

const typeConfig = {
  danger:  { Icon: AlertIcon,     color: '#FF2D78', bg: 'bg-[#FF2D78]/5',  border: 'border-[#FF2D78]/20' },
  warning: { Icon: LightningIcon, color: '#EAB308', bg: 'bg-yellow-400/5', border: 'border-yellow-400/20' },
  good:    { Icon: ShieldIcon,    color: '#AAFF00', bg: 'bg-neon-green/5', border: 'border-neon-green/20' },
  info:    { Icon: EyeIcon,       color: '#00F5FF', bg: 'bg-neon-cyan/5',  border: 'border-neon-cyan/20'  },
}

export default function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className="mb-10">
      <h3 className="font-display text-2xl tracking-wider text-white mb-4">
        Mental <span className="text-neon-pink">Debrief</span>
      </h3>
      <div className="space-y-3">
        {insights.map((insight, i) => {
          const cfg = typeConfig[insight.type]
          return (
            <div
              key={i}
              className={`flex gap-4 p-4 rounded-xl border ${cfg.border} ${cfg.bg} transition-colors`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <cfg.Icon size={18} color={cfg.color} />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{insight.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
