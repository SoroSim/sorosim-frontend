import { useState } from 'react'
import type { StateDiff } from '../types'

interface StateDiffViewerProps {
  diffs: StateDiff[]
}

export default function StateDiffViewer({ diffs }: StateDiffViewerProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

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

  return (
    <div className="space-y-3">
      {/* Stats Summary */}
      <div className="flex gap-2 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 rounded"></span>
          <span className="font-medium">{stats.added}</span>
          <span className="text-gray-500">Added</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-yellow-500 rounded"></span>
          <span className="font-medium">{stats.modified}</span>
          <span className="text-gray-500">Modified</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500 rounded"></span>
          <span className="font-medium">{stats.removed}</span>
          <span className="text-gray-500">Removed</span>
        </div>
      </div>

      {/* Diff Entries */}
      <div className="space-y-2">
        {diffs.map((diff, index) => {
          const isExpanded = expandedKeys.has(diff.key)
          
          return (
            <div
              key={`${diff.key}-${index}`}
              className={`border-l-4 rounded-r overflow-hidden ${getDiffBorderColor(diff.type)}`}
            >
              {/* Header */}
              <div
                className={`px-3 py-2 cursor-pointer hover:bg-opacity-20 transition-colors ${getDiffBgColor(diff.type)}`}
                onClick={() => toggleExpanded(diff.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{getDiffIcon(diff.type)}</span>
                    <span className="font-mono text-sm font-semibold truncate">
                      {diff.key}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getDiffBadgeColor(diff.type)}`}>
                      {diff.type.toUpperCase()}
                    </span>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700 text-xs font-medium">
                    {isExpanded ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-200">
                  {/* Before/After Comparison */}
                  {diff.type === 'modified' && (
                    <div className="grid grid-cols-2 divide-x divide-gray-200">
                      {/* Before */}
                      <div className="p-3">
                        <div className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                          <span>−</span> Before
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                          <pre className="text-xs font-mono text-red-800 overflow-x-auto whitespace-pre-wrap break-all">
                            {formatValue(diff.oldValue)}
                          </pre>
                        </div>
                      </div>

                      {/* After */}
                      <div className="p-3">
                        <div className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                          <span>+</span> After
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <pre className="text-xs font-mono text-green-800 overflow-x-auto whitespace-pre-wrap break-all">
                            {formatValue(diff.newValue)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Added */}
                  {diff.type === 'added' && (
                    <div className="p-3">
                      <div className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                        <span>+</span> New Value
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <pre className="text-xs font-mono text-green-800 overflow-x-auto whitespace-pre-wrap break-all">
                          {formatValue(diff.newValue)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Removed */}
                  {diff.type === 'removed' && (
                    <div className="p-3">
                      <div className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                        <span>−</span> Deleted Value
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <pre className="text-xs font-mono text-red-800 overflow-x-auto whitespace-pre-wrap break-all">
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
