'use client'

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  LineChart, Line, CartesianGrid, ReferenceLine,
} from 'recharts'

interface RadarPoint  { metric: string; score: number }
interface HoldBucket  { label: string; count: number; wins: number }
interface PnlPoint    { n: number; pnl: number }

// ── Radar ─────────────────────────────────────────────────────────────────────
export function DegenRadar({ data }: { data: RadarPoint[] }) {
  return (
    <div className="token-card mb-6">
      <h3 className="font-display text-xl tracking-wider text-white mb-4">
        Psychological <span className="text-neon-green">Profile</span>
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#6b7280', fontSize: 11 }}
          />
          <Radar
            dataKey="score"
            stroke="#AAFF00"
            fill="#AAFF00"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Hold time histogram ───────────────────────────────────────────────────────
export function HoldHistogram({ data }: { data: HoldBucket[] }) {
  return (
    <div className="token-card mb-6">
      <h3 className="font-display text-xl tracking-wider text-white mb-1">
        Patience <span className="text-neon-pink">Analysis</span>
      </h3>
      <p className="text-gray-500 text-xs mb-4">Hold duration per closed position — key impulse control indicator</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis  tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: 8 }}
            labelStyle={{ color: '#fff' }}
          />
          <Bar dataKey="count" name="count" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i < 2 ? '#FF2D78' : i < 4 ? '#00F5FF' : '#AAFF00'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Cumulative P&L ────────────────────────────────────────────────────────────
export function CumPnlChart({ data }: { data: PnlPoint[] }) {
  const isPositive = data.length > 0 && data[data.length - 1].pnl >= 0

  return (
    <div className="token-card mb-6">
      <h3 className="font-display text-xl tracking-wider text-white mb-1">
        Account <span className="text-neon-cyan">Trauma</span> History
      </h3>
      <p className="text-gray-500 text-xs mb-4">Cumulative realised P&L across all closed positions — SOL basis</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="n" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Trade #', fill: '#6b7280', fontSize: 11, position: 'insideBottomRight', offset: 0 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: 8 }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="pnl"
            stroke={isPositive ? '#AAFF00' : '#FF2D78'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: isPositive ? '#AAFF00' : '#FF2D78' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
