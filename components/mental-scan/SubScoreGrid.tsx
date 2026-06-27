import { LightningIcon, DiamondIcon, CrosshairIcon, ShieldIcon, BrainIcon, EyeIcon } from '@/components/Icons'

interface SubScores {
  impulseControl: number; diamondHands: number; winRateQuality: number
  riskManagement: number; emotionalControl: number
}

const CRITERIA = [
  { key: 'impulseControl'   as const, label: 'Impulse Control',   clinical: 'Premature exit frequency & hold discipline',    Icon: LightningIcon },
  { key: 'diamondHands'     as const, label: 'Diamond Hands',     clinical: 'Median hold duration on profitable positions',   Icon: DiamondIcon   },
  { key: 'winRateQuality'   as const, label: 'Win Rate Quality',  clinical: 'Win frequency weighted by profit factor ratio',  Icon: CrosshairIcon  },
  { key: 'riskManagement'   as const, label: 'Risk Management',   clinical: 'Position sizing consistency coefficient',        Icon: ShieldIcon    },
  { key: 'emotionalControl' as const, label: 'Emotional Control', clinical: 'Tilt episodes, revenge sizing, loss streak data', Icon: BrainIcon     },
]

function scoreColor(s: number) {
  if (s >= 75) return '#AAFF00'
  if (s >= 55) return '#00F5FF'
  if (s >= 35) return '#FFD700'
  return '#FF2D78'
}

function scoreLabel(s: number) {
  if (s >= 75) return 'Healthy'
  if (s >= 55) return 'Moderate'
  if (s >= 35) return 'Impaired'
  return 'Critical'
}

export default function SubScoreGrid({ scores }: { scores: SubScores }) {
  return (
    <div className="mb-10">
      <div className="mb-4">
        <h3 className="font-display text-2xl tracking-wider text-white">
          Diagnostic <span className="text-neon-cyan">Criteria</span>
        </h3>
        <p className="text-gray-500 text-xs mt-0.5">DSM-D Psychiatric Evaluation — Five-Axis Behavioral Assessment</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CRITERIA.map(m => {
          const val   = scores[m.key]
          const color = scoreColor(val)
          const label = scoreLabel(val)
          return (
            <div key={m.key} className="token-card">
              <div className="flex items-start justify-between mb-3">
                <m.Icon size={20} color={color} />
                <span
                  className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border"
                  style={{ color, borderColor: color + '40', backgroundColor: color + '10' }}
                >
                  {label}
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
              <p className="text-gray-500 text-xs">{m.clinical}</p>
            </div>
          )
        })}

        {/* Methodology note */}
        <div className="token-card flex flex-col justify-center items-center text-center border-dashed">
          <EyeIcon size={20} color="#4b5563" className="mb-2" />
          <p className="text-gray-600 text-xs leading-relaxed">
            DSM-D scores derived from FIFO position reconstruction across full on-chain history. Assessment accuracy improves with trade volume.
          </p>
        </div>
      </div>
    </div>
  )
}
