'use client'

import type { HistoryEntry } from './life-counter'
import { HistoryChart } from './history-chart'
import { GitBranch } from 'lucide-react'

export function HistoryContent({ history, onSelectRollback }: { history: HistoryEntry[]; onSelectRollback?: (value: number) => void }) {
  return (
    <div className="settings-content">
      <HistoryChart history={history} maxLife={20} />
      <div className="history-list">
        {history.length ? (
          [...history].reverse().slice(0, 20).map((entry, index) => (
            <button
              key={`${entry.at}-${index}`}
              className="history-row"
              onClick={() => index > 0 && onSelectRollback?.(entry.value)}
              disabled={index === 0}
              style={index === 0 ? { cursor: 'default', opacity: 0.6 } : {}}
            >
              <span className="history-life">{entry.value} LIFE</span>
              <div className="history-right">
                {entry.isRollback && <GitBranch size={16} className="history-icon" />}
                <time className="history-time" suppressHydrationWarning>{new Date(entry.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
              </div>
            </button>
          ))
        ) : (
          <p className="empty-history">Changes will appear here after you play.</p>
        )}
      </div>
    </div>
  )
}
