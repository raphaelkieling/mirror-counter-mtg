'use client'

import type { HistoryEntry } from './life-counter'
import { HistoryChart } from './history-chart'
import { GitBranch } from 'lucide-react'

export function HistoryContent({ history, onSelectRollback }: { history: HistoryEntry[]; onSelectRollback?: (value: number) => void }) {
  const displayHistory = [...history].slice(-20).reverse()

  return (
    <div className="settings-content">
      <HistoryChart history={history} maxLife={20} />
      <div className="history-list">
        {displayHistory.length ? (
          displayHistory.map((entry, index) => {
            const delta = index === displayHistory.length - 1 ? 0 : entry.value - displayHistory[index + 1].value
            const color = delta > 0 ? '#22c55e' : delta < 0 ? '#ef4444' : undefined
            const showDelta = index < displayHistory.length - 1
            return (
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
                  {showDelta && color && (
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: delta > 0 ? '#dcfce7' : '#fee2e2',
                      color: delta > 0 ? '#166534' : '#991b1b',
                      minWidth: 'fit-content',
                      textAlign: 'center'
                    }}>
                      {delta > 0 ? '+' : ''}{delta}
                    </span>
                  )}
                  <time className="history-time" suppressHydrationWarning>{new Date(entry.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                </div>
              </button>
            )
          })
        ) : (
          <p className="empty-history">Changes will appear here after you play.</p>
        )}
      </div>
    </div>
  )
}
