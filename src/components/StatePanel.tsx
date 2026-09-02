import { useState } from 'react'
import LedgerEntryEditor from './LedgerEntryEditor'
import type { LedgerEntry } from '../types'

export default function StatePanel() {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])

  return (
    <div className="space-y-6">
      {/* Mock Ledger State */}
      <div className="panel">
        <div className="panel-header">Mock Ledger State</div>
        <div className="panel-content">
          <LedgerEntryEditor
            entries={ledgerEntries}
            onEntriesChange={setLedgerEntries}
          />
        </div>
      </div>

      {/* State Diff Viewer */}
      <div className="panel">
        <div className="panel-header">State Changes</div>
        <div className="panel-content">
          <div className="bg-gray-50 rounded p-4 text-sm text-gray-500">
            State changes will appear here after simulation
          </div>
          <div className="mt-3 flex gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded"></span>
              Added
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-500 rounded"></span>
              Modified
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              Removed
            </span>
          </div>
        </div>
      </div>

      {/* Events Panel */}
      <div className="panel">
        <div className="panel-header">Contract Events</div>
        <div className="panel-content">
          <div className="bg-gray-50 rounded p-4 text-sm text-gray-500">
            Emitted events will appear here after simulation
          </div>
        </div>
      </div>
    </div>
  )
}
