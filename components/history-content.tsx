'use client'

import type { HistoryEntry } from './life-counter'
import { HistoryChart } from './history-chart'

export function HistoryContent({ history }: { history: HistoryEntry[] }) {
  return (
    <>
      <HistoryChart history={history} maxLife={20} />
      <div className="history-list">
        {history.length ? (
          [...history].reverse().slice(0, 20).map((entry, index) => (
            <div className="history-row" key={`${entry.at}-${index}`}>
              <span>{entry.value} LIFE</span>
              <time suppressHydrationWarning>{new Date(entry.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
            </div>
          ))
        ) : (
          <p className="empty-history">Changes will appear here after you play.</p>
        )}
      </div>
    </>
  )
}
