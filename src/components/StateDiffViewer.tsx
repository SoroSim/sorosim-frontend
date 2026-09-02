import { useState } from 'react'
import type { StateDiff } from '../types'

interface StateDiffViewerProps {
  diffs: StateDiff[]
}

export default function StateDiffViewer({ diffs }: StateDiffViewerProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [filterType, setFilterType] = useState<StateDiff['type'] | 'all'>('all')

  if (diffs.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-3xl mb-2">📊</div>
        <div className="text-gray-500 text-sm">
          No state changes detected
        </div>
        <div className="text-gray-400 text-xs mt-1">
          State diffs will appear here after simulation
        </div>
      </div>
    )
  }

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedKeys)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedKeys(newExpanded)
  }

  const stats = {
    added: diffs.filter(d => d.type === 'added').length,
    modified: diffs.filter(d => d.type === 'modified').length,
    removed: diffs.filter(d => d.type === 'removed').length,
  }

  const filteredDiffs = filterType === 'all' 
    ? diffs 
    : diffs.filter(d => d.type === filterType)

  return (
    <div className="space-y-3">
      {/* Stats Summary with Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-1 rounded transition-colors ${
              filterType === 'all' 
                ? 'bg-gray-200 font-semibold' 
                : 'hover:bg-gray-100'
            }`}
          >
            All ({diffs.length})
          </button>
          <button
            onClick={() => setFilterType('added')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              filterType === 'added'
                ? 'bg-green-100 text-green-800 font-semibold'
                : 'hover:bg-green-50'
            }`}
            disabled={stats.added === 0}
          >
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>{stats.added}</span>
          </button>
          <button
            onClick={() => setFilterType('modified')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              filterType === 'modified'
                ? 'bg-yellow-100 text-yellow-800 font-semibold'
                : 'hover:bg-yellow-50'
            }`}
            disabled={stats.modified === 0}
          >
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span>{stats.modified}</span>
          </button>
          <button
            onClick={() => setFilterType('removed')}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              filterType === 'removed'
                ? 'bg-red-100 text-red-800 font-semibold'
                : 'hover:bg-red-50'
            }`}
            disabled={stats.removed === 0}
          >
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span>{stats.removed}</span>
          </button>
        </div>

        {/* Expand/Collapse All */}
        <div className="flex gap-1">
          <button
            onClick={() => setExpandedKeys(new Set(filteredDiffs.map(d => d.key)))}
            className="text-xs text-stellar-purple hover:underline"
          >
            Expand All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => setExpandedKeys(new Set())}
            className="text-xs text-stellar-purple hover:underline"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Filtered Message */}
      {filterType !== 'all' && (
        <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded px-2 py-1">
          Showing {filteredDiffs.length} {filterType} {filteredDiffs.length === 1 ? 'entry' : 'entries'}
        </div>
      )}

      {/* Diff Entries */}
      <div className="space-y-2">
        {filteredDiffs.map((diff, index) => {
          const isExpanded = expandedKeys.has(diff.key)
          
          return (
            <div
              key={`${diff.key}-${index}`}
              className={`border-l-4 rounded-r overflow-hidden shadow-sm hover:shadow-md transition-shadow ${getDiffBorderColor(diff.type)}`}
            >
              {/* Header */}
              <div
                className={`px-3 py-2 cursor-pointer hover:bg-opacity-30 transition-colors ${getDiffBgColor(diff.type)}`}
                onClick={() => toggleExpanded(diff.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg flex-shrink-0">{getDiffIcon(diff.type)}</span>
                    <span className="font-mono text-sm font-semibold truncate">
                      {diff.key}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold uppercase flex-shrink-0 ${getDiffBadgeColor(diff.type)}`}>
                      {diff.type}
                    </span>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700 text-xs font-bold ml-2 flex-shrink-0">
                    {isExpanded ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="bg-white border-t-2 border-gray-200">
                  {/* Before/After Comparison */}
                  {diff.type === 'modified' && (
                    <div className="grid grid-cols-2 divide-x divide-gray-300">
                      {/* Before */}
                      <div className="p-3 bg-red-50 bg-opacity-30">
                        <div className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1">
                          <span className="text-base">−</span> BEFORE
                        </div>
                        <div className="bg-red-50 border-2 border-red-300 rounded p-2">
                          <pre className="text-xs font-mono text-red-900 overflow-x-auto whitespace-pre-wrap break-all">
                            {formatValue(diff.oldValue)}
                          </pre>
                        </div>
                      </div>

                      {/* After */}
                      <div className="p-3 bg-green-50 bg-opacity-30">
                        <div className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1">
                          <span className="text-base">+</span> AFTER
                        </div>
                        <div className="bg-green-50 border-2 border-green-300 rounded p-2">
                          <pre className="text-xs font-mono text-green-900 overflow-x-auto whitespace-pre-wrap break-all">
                            {formatValue(diff.newValue)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Added */}
                  {diff.type === 'added' && (
                    <div className="p-3 bg-green-50 bg-opacity-50">
                      <div className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1">
                        <span className="text-base">+</span> NEW VALUE
                      </div>
                      <div className="bg-green-50 border-2 border-green-400 rounded p-2">
                        <pre className="text-xs font-mono text-green-900 overflow-x-auto whitespace-pre-wrap break-all">
                          {formatValue(diff.newValue)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Removed */}
                  {diff.type === 'removed' && (
                    <div className="p-3 bg-red-50 bg-opacity-50">
                      <div className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1">
                        <span className="text-base">−</span> DELETED VALUE
                      </div>
                      <div className="bg-red-50 border-2 border-red-400 rounded p-2">
                        <pre className="text-xs font-mono text-red-900 overflow-x-auto whitespace-pre-wrap break-all">
                          {formatValue(diff.oldValue)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredDiffs.length === 0 && filterType !== 'all' && (
        <div className="text-center py-6 text-gray-400 text-sm">
          No {filterType} entries found
        </div>
      )}
    </div>
  )
}

function getDiffBorderColor(type: StateDiff['type']): string {
  switch (type) {
    case 'added':
      return 'border-green-500'
    case 'modified':
      return 'border-yellow-500'
    case 'removed':
      return 'border-red-500'
  }
}

function getDiffBgColor(type: StateDiff['type']): string {
  switch (type) {
    case 'added':
      return 'bg-green-50'
    case 'modified':
      return 'bg-yellow-50'
    case 'removed':
      return 'bg-red-50'
  }
}

function getDiffBadgeColor(type: StateDiff['type']): string {
  switch (type) {
    case 'added':
      return 'bg-green-100 text-green-800'
    case 'modified':
      return 'bg-yellow-100 text-yellow-800'
    case 'removed':
      return 'bg-red-100 text-red-800'
  }
}

function getDiffIcon(type: StateDiff['type']): string {
  switch (type) {
    case 'added':
      return '➕'
    case 'modified':
      return '✏️'
    case 'removed':
      return '🗑️'
  }
}

function formatValue(value: string | undefined): string {
  if (!value) return '(empty)'
  
  try {
    const parsed = JSON.parse(value)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return value
  }
}
