import { useState } from 'react'
import type { ContractEvent } from '../types'

interface ContractEventsViewerProps {
  events: ContractEvent[]
}

export default function ContractEventsViewer({ events }: ContractEventsViewerProps) {
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-3xl mb-2">📡</div>
        <div className="text-gray-500 text-sm">
          No events emitted
        </div>
        <div className="text-gray-400 text-xs mt-1">
          Contract events will appear here after simulation
        </div>
      </div>
    )
  }

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedIndices)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedIndices(newExpanded)
  }

  const filteredEvents = searchTerm
    ? events.filter((event) =>
        event.topics.some((topic) =>
          topic.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        event.data.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.contractId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : events

  return (
    <div className="space-y-3">
      {/* Header with Search */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-gray-700">
          {events.length} {events.length === 1 ? 'Event' : 'Events'} Emitted
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={() => setExpandedIndices(new Set(filteredEvents.map((_, i) => i)))}
            className="text-xs text-stellar-purple hover:underline"
          >
            Expand All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => setExpandedIndices(new Set())}
            className="text-xs text-stellar-purple hover:underline"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {events.length > 3 && (
        <div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events by topic, data, or contract ID..."
            className="input-field text-sm"
          />
        </div>
      )}

      {/* Events List */}
      <div className="space-y-2">
        {filteredEvents.map((event, index) => {
          const isExpanded = expandedIndices.has(index)
          const primaryTopic = event.topics[0] || 'unknown'
          
          return (
            <div
              key={index}
              className="border border-blue-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              {/* Event Header */}
              <div
                className="px-3 py-2 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => toggleExpanded(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg">📢</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-semibold text-blue-900 truncate">
                        {primaryTopic}
                      </div>
                      {event.contractId && (
                        <div className="text-xs text-blue-600 truncate">
                          {event.contractId}
                        </div>
                      )}
                    </div>
                    {event.topics.length > 1 && (
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-semibold flex-shrink-0">
                        {event.topics.length} topics
                      </span>
                    )}
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-xs font-bold ml-2 flex-shrink-0">
                    {isExpanded ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t-2 border-blue-200">
                  {/* Topics Section */}
                  <div className="p-3 bg-blue-50 bg-opacity-50 border-b border-blue-100">
                    <div className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1">
                      🏷️ TOPICS ({event.topics.length})
                    </div>
                    <div className="space-y-1">
                      {event.topics.map((topic, topicIndex) => (
                        <div
                          key={topicIndex}
                          className="bg-white border border-blue-200 rounded p-2 flex items-start gap-2"
                        >
                          <span className="text-xs font-semibold text-blue-600 flex-shrink-0">
                            [{topicIndex}]
                          </span>
                          <code className="text-xs font-mono text-blue-900 break-all flex-1">
                            {topic}
                          </code>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Section */}
                  <div className="p-3 bg-gray-50">
                    <div className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                      📦 EVENT DATA
                    </div>
                    <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-3">
                      <pre className="text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap break-all">
                        {formatEventData(event.data)}
                      </pre>
                    </div>
                  </div>

                  {/* Contract ID Section (if not in header) */}
                  {event.contractId && (
                    <div className="px-3 pb-3 bg-gray-50">
                      <div className="text-xs font-bold text-gray-700 mb-1">
                        📍 CONTRACT ID
                      </div>
                      <code className="text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded px-2 py-1 block break-all">
                        {event.contractId}
                      </code>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* No Results Message */}
      {filteredEvents.length === 0 && searchTerm && (
        <div className="text-center py-6 text-gray-400 text-sm">
          No events match "{searchTerm}"
        </div>
      )}

      {/* Events Summary */}
      {events.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
          💡 <strong>Tip:</strong> Events are emitted by the contract during execution. 
          Topics typically identify the event type, while data contains the event payload.
        </div>
      )}
    </div>
  )
}

function formatEventData(data: string): string {
  if (!data) return '(empty)'
  
  try {
    const parsed = JSON.parse(data)
    return JSON.stringify(parsed, null, 2)
  } catch {
    // If not JSON, try to make it more readable
    return data
  }
}
