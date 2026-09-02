import { useState } from 'react'
import LedgerEntryEditor from './LedgerEntryEditor'
import StateDiffViewer from './StateDiffViewer'
import ContractEventsViewer from './ContractEventsViewer'
import type { LedgerEntry, StateDiff, ContractEvent } from '../types'
import { SAMPLE_SNAPSHOTS } from '../utils/sampleSnapshots'

interface LedgerSnapshot {
  version: string
  timestamp: number
  entries: LedgerEntry[]
}

interface StatePanelProps {
  ledgerEntries: LedgerEntry[]
  setLedgerEntries: (entries: LedgerEntry[]) => void
  stateDiff?: StateDiff[]
  events?: ContractEvent[]
}

export default function StatePanel({ 
  ledgerEntries, 
  setLedgerEntries, 
  stateDiff = [],
  events = []
}: StatePanelProps) {
  const [showSampleMenu, setShowSampleMenu] = useState(false)

  const handleExportLedger = () => {
    const snapshot: LedgerSnapshot = {
      version: '1.0.0',
      timestamp: Date.now(),
      entries: ledgerEntries,
    }

    const json = JSON.stringify(snapshot, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `ledger-snapshot-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportLedger = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const snapshot = JSON.parse(content) as LedgerSnapshot
        
        // Validate structure
        if (!snapshot.entries || !Array.isArray(snapshot.entries)) {
          alert('Invalid ledger snapshot file: missing entries array')
          return
        }

        // Validate each entry has required fields
        for (const entry of snapshot.entries) {
          if (!entry.id || !entry.type || !entry.data) {
            alert('Invalid ledger snapshot file: entries missing required fields')
            return
          }
        }

        setLedgerEntries(snapshot.entries)
        alert(`Successfully imported ${snapshot.entries.length} ledger entries`)
      } catch (err) {
        alert('Failed to parse ledger snapshot file. Please ensure it is valid JSON.')
        console.error('Import error:', err)
      }
    }
    reader.readAsText(file)
    
    // Reset input so same file can be selected again
    event.target.value = ''
  }

  const handleLoadSample = (sampleName: keyof typeof SAMPLE_SNAPSHOTS) => {
    const entries = SAMPLE_SNAPSHOTS[sampleName]()
    setLedgerEntries(entries)
    setShowSampleMenu(false)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mock Ledger State */}
      <div className="panel">
        <div className="panel-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span>Mock Ledger State</span>
          
          {/* Import/Export Actions */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            {/* Sample Snapshots */}
            <div className="relative">
              <button
                onClick={() => setShowSampleMenu(!showSampleMenu)}
                className="text-sm text-gray-600 hover:text-stellar-purple font-medium whitespace-nowrap"
                title="Load sample snapshot"
              >
                📋 Samples
              </button>
              
              {showSampleMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSampleMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 min-w-[180px]">
                    {Object.keys(SAMPLE_SNAPSHOTS).map((name) => (
                      <button
                        key={name}
                        onClick={() => handleLoadSample(name as keyof typeof SAMPLE_SNAPSHOTS)}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t last:rounded-b"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <label
              htmlFor="import-ledger"
              className="text-sm text-stellar-purple hover:underline cursor-pointer font-medium whitespace-nowrap"
              title="Import ledger snapshot"
            >
              📥 Import
            </label>
            <input
              id="import-ledger"
              type="file"
              accept=".json,application/json"
              onChange={handleImportLedger}
              className="hidden"
            />
            
            <button
              onClick={handleExportLedger}
              disabled={ledgerEntries.length === 0}
              className="text-sm text-stellar-purple hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              title="Export ledger snapshot"
            >
              📤 Export
            </button>
          </div>
        </div>
        <div className="panel-content">
          <LedgerEntryEditor
            entries={ledgerEntries}
            onEntriesChange={setLedgerEntries}
          />
          
          {ledgerEntries.length > 0 && (
            <div className="mt-3 text-xs text-gray-500">
              💡 Use "Export" to save this ledger state as a JSON file for later reuse
            </div>
          )}
        </div>
      </div>

      {/* State Diff Viewer */}
      <div className="panel">
        <div className="panel-header">State Changes</div>
        <div className="panel-content">
          <StateDiffViewer diffs={stateDiff} />
        </div>
      </div>

      {/* Events Panel */}
      <div className="panel">
        <div className="panel-header">Contract Events</div>
        <div className="panel-content">
          <ContractEventsViewer events={events} />
        </div>
      </div>
    </div>
  )
}
