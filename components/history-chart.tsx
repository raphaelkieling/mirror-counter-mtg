'use client'

import type { HistoryEntry } from './life-counter'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export function HistoryChart({ history, maxLife }: { history: HistoryEntry[]; maxLife: number }) {
  if (history.length === 0) return null

  const data = history.map((entry, index) => ({
    index: index + 1,
    value: entry.value,
  }))

  return (
    <div style={{ marginBottom: '20px', width: '100%', height: '120px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="index"
            stroke="#d9d7df"
            style={{ fontSize: '11px' }}
            tick={{ fill: '#706f79' }}
            axisLine={{ stroke: '#d9d7df' }}
          />
          <YAxis
            stroke="#d9d7df"
            domain={[0, maxLife]}
            style={{ fontSize: '11px' }}
            tick={{ fill: '#706f79' }}
            axisLine={{ stroke: '#d9d7df' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#111116"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
