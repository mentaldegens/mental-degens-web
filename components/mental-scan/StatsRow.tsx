function fmt(sol: number) {
  return (sol >= 0 ? '+' : '') + sol.toFixed(3) + ' SOL'
}

function fmtTime(ms: number) {
  const h = ms / 3_600_000
  if (h < 1)   return `${Math.round(h * 60)}m`
  if (h < 24)  return `${Math.round(h)}h`
  return `${Math.round(h / 24)}d`
}

interface Stats {
  totalTrades: number
  openPositions: number
  winRate: number
  totalPnlSol: number
  avgHoldMs: number
  bestTradePnl: number
  worstTradePnl: number
  avgWinSol: number
  avgLossSol: number
}

export default function StatsRow({ stats, dataQuality }: {
  stats: Stats
  dataQuality: { transactionsFetched: number; swapsFound: number; closedPositions: number }
}) {
  const cards = [
    { label: 'Trades Analysed', value: stats.totalTrades.toString(),        sub: `${dataQuality.swapsFound} swaps parsed` },
    { label: 'Win Rate',        value: `${stats.winRate}%`,                  sub: `from ${stats.totalTrades} closed trades`  },
    { label: 'Total P&L',       value: fmt(stats.totalPnlSol),               sub: 'realised SOL', color: stats.totalPnlSol >= 0 ? '#AAFF00' : '#FF2D78' },
    { label: 'Avg Hold Time',   value: fmtTime(stats.avgHoldMs),             sub: 'per closed trade' },
    { label: 'Best Trade',      value: fmt(stats.bestTradePnl),              sub: 'single trade profit', color: '#AAFF00' },
    { label: 'Worst Trade',     value: fmt(stats.worstTradePnl),             sub: 'single trade loss',   color: '#FF2D78' },
    { label: 'Avg Win',         value: fmt(stats.avgWinSol),                 sub: 'per winning trade', color: '#AAFF00' },
    { label: 'Avg Loss',        value: fmt(stats.avgLossSol),                sub: 'per losing trade',  color: '#FF2D78' },
  ]

  return (
    <div className="mb-10">
      <h3 className="font-display text-2xl tracking-wider text-white mb-4">
        Trade <span className="text-neon-cyan">Statistics</span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className="p-4 rounded-xl border border-degen-border bg-degen-dark/60">
            <p
              className="font-display text-2xl leading-none mb-1"
              style={{ color: c.color ?? '#fff' }}
            >
              {c.value}
            </p>
            <p className="text-white text-xs font-semibold mb-0.5">{c.label}</p>
            <p className="text-gray-600 text-xs">{c.sub}</p>
          </div>
        ))}
      </div>
      <p className="text-gray-700 text-xs mt-3">
        Based on {dataQuality.transactionsFetched} transactions fetched · {dataQuality.closedPositions} closed positions · {stats.openPositions} still open
      </p>
    </div>
  )
}
