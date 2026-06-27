import { LightningIcon, DiamondIcon, CrosshairIcon, ShieldIcon, BrainIcon, EyeIcon } from '@/components/Icons'

interface SubScores {
  impulseControl: number
  diamondHands: number
  winRateQuality: number
  riskManagement: number
  emotionalControl: number
}

const METRICS = [
  { key: 'impulseControl'   as const, label: 'Impulse Control',  desc: 'How quickly you exit — especially winners', Icon: LightningIcon },
  { key: 'diamondHands'     as const, label: 'Diamond Hands',    desc: 'Patience on winning trades over time',      Icon: DiamondIcon   },
  { key: 'winRateQuality'   as const, label: 'Win Rate Quality', desc: 'Win rate weighted by profit factor',        Icon: CrosshairIcon  },
  { key: 'riskManagement'   as const, label: 'Risk Management',  desc: 'Position sizing consistency & discipline',  Icon: ShieldIcon    },
  { key: 'emotionalControl' as const, label: 'Emotional Control',desc: 'Revenge trading & tilt streak detection',   Icon: BrainIcon     },
]

function scoreColor(s: number) {
  if (s >= 75) return '#AAFF00'
  if (s >= 55) return '#00F5FF'
  if (s >= 35) return '#FF2D78'
  return '#B400FF'
}

function scoreTier(s: number) {
  if (s >= 75) return 'Elite'
  if (s >= 55) return 'Solid'
  if (s >= 35) return 'Weak'
  return 'Critical'
}

export default function SubScoreGrid({ scores }: { scores: SubScores }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
      {METRICS.map(m => {
        const val   = scores[m.key]
        const color = scoreColor(val)
        const tier  = scoreTier(val)
        return (
          <div key={m.key} className="token-card">
            <div className="flex items-start justify-between mb-3">
              <m.Icon size={22} color={color} />
              <span
                className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border"
                style={{ color, borderColor: color + '40', backgroundColor: color + '10' }}
              >
                {tier}
              </span>
            </div>
            <div className="mb-3">
              <div className="flex items-end justify-between mb-1.5">
                <span className="font-display text-4xl leading-none" style={{ color }}>{val}</span>
                <span className="text-gray-600 text-xs">/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-degen-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${val}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
                />
              </div>
            </div>
            <h3 className="text-white font-semibold text-sm mb-0.5">{m.label}</h3>
            <p className="text-gray-500 text-xs">{m.desc}</p>
          </div>
        )
      })}

      <div className="token-card flex flex-col justify-center items-center text-center border-dashed">
        <EyeIcon size={22} color="#4b5563" className="mb-2" />
        <p className="text-gray-500 text-xs leading-relaxed">
          Scores calculated from actual on-chain trade history using FIFO position reconstruction — hold times, P&L ratios, and behavioral pattern detection.
        </p>
      </div>
    </div>
  )
}
