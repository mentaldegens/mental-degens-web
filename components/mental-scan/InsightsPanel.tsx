export default function InsightsPanel({ insights }: { insights: string[] }) {
  return (
    <div className="mb-10">
      <h3 className="font-display text-2xl tracking-wider text-white mb-4">
        Mental <span className="text-neon-pink">Debrief</span>
      </h3>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 rounded-xl border border-degen-border bg-degen-dark/60 hover:border-neon-green/20 transition-colors"
          >
            <span className="text-xl flex-shrink-0 mt-0.5">{insight.slice(0, 2)}</span>
            <p className="text-gray-300 text-sm leading-relaxed">{insight.slice(2).trim()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
