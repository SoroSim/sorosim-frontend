import { useState } from 'react'
import type { InvocationHistory } from '../types'

interface InvocationHistoryProps {
  history: InvocationHistory[]
  onReplay: (entry: InvocationHistory) => void
  onClear: () => void
}

export default function InvocationHistory({
  history,
  onReplay,
  onClear,
}: InvocationHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-3xl mb-2">📜</div>
        <div className="text-gray-500 text-sm">
          No invocations yet
        </div>
        <div className="text-gray-400 text-xs mt-1">
          Your simulation history will appear here
        </div>
      </div>
    )
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleReplay = (entry: InvocationHistory, e: React.MouseEvent) => {
    e.stopPropagation()
    onReplay(entry)
  }

  const handleClear = () => {
    if (showClearConfirm) {
      onClear()
      setShowClearConfirm(false)
    } else {
      setShowClearConfirm(true)
      setTimeout(() => setShowClearConfirm(false), 3000)
    }
  }

  return (
    <div className="space-y-3">
      {/* Header with Clear Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-700">
          {history.length} {history.length === 1 ? 'Invocation' : 'Invocations'}
        </div>
        <button
          onClick={handleClear}
          className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
            showClearConfirm
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          {showClearConfirm ? '⚠️ Click again to confirm' : '🗑️ Clear History'}
        </button>
      </div>

      {/* History List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {[...history].reverse().map((entry, index) => {
          const isExpanded = expandedId === entry.id
          const displayIndex = history.length - index
          
          return (
            <div
              key={entry.id}
              className={`border rounded-lg overflow-hidden shadow-sm transition-all ${
                entry.result.success
                  ? 'border-green-200 hover:border-green-300'
                  : 'border-red-200 hover:border-red-300'
              }`}
            >
              {/* Header */}
              <div
                className={`px-3 py-2 cursor-pointer transition-colors ${
                  entry.result.success
                    ? 'bg-green-50 hover:bg-green-100'
                    : 'bg-red-50 hover:bg-red-100'
                }`}
                onClick={() => toggleExpanded(entry.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500">
                        #{displayIndex}
                      </span>
                      <span
                        className={`text-lg ${
                          entry.result.success ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {entry.result.success ? '✓' : '✗'}
                      </span>
                      <span className="font-mono text-sm font-semibold truncate">
                        {entry.functionName}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => handleReplay(entry, e)}
                      className="text-xs bg-stellar-purple text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors font-medium"
                      title="Replay this invocation"
                    >
                      ▶ Replay
                    </button>
                    <button className="text-gray-500 hover:text-gray-700 text-xs font-bold">
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t-2 border-gray-200 bg-white">
                  {/* Arguments Section */}
                  {entry.arguments.length > 0 && (
                    <div className="p-3 border-b border-gray-100">
                      <div className="text-xs font-bold text-gray-700 mb-2">
                        📝 ARGUMENTS
                      </div>
                      <div className="space-y-1">
                        {entry.arguments.map((arg, argIndex) => (
                          <div
                            key={argIndex}
                            className="bg-gray-50 border border-gray-200 rounded p-2"
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-semibold text-gray-600 flex-shrink-0">
                                {arg.name}:
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs text-gray-500 block">
                                  {arg.type}
                                </span>
                                <code className="text-xs font-mono text-gray-800 break-all block mt-0.5">
                                  {arg.value}
                                </code>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Result Summary */}
                  <div className="p-3 bg-gray-50">
                    <div className="text-xs font-bold text-gray-700 mb-2">
                      📊 RESULT
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`font-semibold ${
                            entry.result.success ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {entry.result.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">State Changes:</span>
                        <span className="font-semibold">
                          {entry.result.stateDiff.length}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Events Emitted:</span>
                        <span className="font-semibold">
                          {entry.result.events.length}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">CPU Instructions:</span>
                        <span className="font-mono text-xs">
                          {entry.result.executionMetadata.cpuInstructions.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Return Value */}
                    {entry.result.returnValue && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-gray-600 mb-1">
                          Return:
                        </div>
                        <div className="bg-gray-900 border border-gray-700 rounded p-2">
                          <pre className="text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap break-all">
                            {tryFormatJson(entry.result.returnValue)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
        💡 <strong>Tip:</strong> Click "Replay" to re-run any previous invocation with the same arguments.
      </div>
    </div>
  )
}

function tryFormatJson(value: string): string {
  try {
    const parsed = JSON.parse(value)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return value
  }
}
