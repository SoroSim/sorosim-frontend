import { useState } from 'react'
import ContractPanel from './components/ContractPanel'
import InvocationPanel from './components/InvocationPanel'
import StatePanel from './components/StatePanel'
import InvocationHistory from './components/InvocationHistory'
import { exportSession, importSession } from './utils/sessionManager'
import type { ContractFunction, LedgerEntry, StateDiff, ContractEvent, InvocationHistory as InvocationHistoryType } from './types'

function App() {
  const [wasmFile, setWasmFile] = useState<File | null>(null)
  const [contractFunctions, setContractFunctions] = useState<string[]>([])
  const [parsedFunctions, setParsedFunctions] = useState<ContractFunction[]>([])
  const [selectedFunction, setSelectedFunction] = useState<string>('')
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [stateDiff, setStateDiff] = useState<StateDiff[]>([])
  const [events, setEvents] = useState<ContractEvent[]>([])
  const [history, setHistory] = useState<InvocationHistoryType[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const handleExportSession = () => {
    exportSession(history, ledgerEntries, wasmFile?.name)
  }

  const handleImportSession = async (file: File) => {
    try {
      const { history: importedHistory, ledgerEntries: importedLedger } = await importSession(file)
      setHistory(importedHistory)
      setLedgerEntries(importedLedger)
      alert(`Successfully imported session with ${importedHistory.length} invocations and ${importedLedger.length} ledger entries`)
    } catch (err) {
      alert(`Failed to import session: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-stellar-dark text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-stellar-purple">Soro</span>Sim
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Soroban Contract Simulation & Dry-Run Sandbox
            </p>
          </div>
          
          {/* Session Import */}
          <div>
            <label
              htmlFor="import-session"
              className="cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
            >
              📂 Import Session
            </label>
            <input
              id="import-session"
              type="file"
              accept=".json,application/json"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleImportSession(file)
                  e.target.value = ''
                }
              }}
              className="hidden"
            />
          </div>
        </div>
      </header>

      {/* Main Content - 3 Panel Layout */}
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Contract Upload & Configuration */}
          <div className="lg:col-span-1">
            <ContractPanel
              wasmFile={wasmFile}
              setWasmFile={setWasmFile}
              contractFunctions={contractFunctions}
              setContractFunctions={setContractFunctions}
              selectedFunction={selectedFunction}
              setSelectedFunction={setSelectedFunction}
              setParsedFunctions={setParsedFunctions}
            />
            
            {/* History Toggle Button */}
            <div className="mt-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                  showHistory
                    ? 'bg-stellar-purple text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showHistory ? '📋 Hide' : '📜 Show'} History ({history.length})
              </button>
            </div>

            {/* History Sidebar */}
            {showHistory && (
              <div className="mt-4 panel">
                <div className="panel-header">Invocation History</div>
                <div className="panel-content">
                  <InvocationHistory
                    history={history}
                    onReplay={(entry) => {
                      // TODO: Implement replay functionality
                      alert(`Replay functionality will be implemented to re-run: ${entry.functionName}`)
                    }}
                    onClear={() => setHistory([])}
                    onExport={handleExportSession}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Middle Panel - Invocation & Arguments */}
          <div className="lg:col-span-1">
            <InvocationPanel
              selectedFunction={selectedFunction}
              wasmFile={wasmFile}
              contractFunctions={parsedFunctions}
              ledgerEntries={ledgerEntries}
              onSimulationComplete={(result, functionName, args) => {
                setStateDiff(result.stateDiff)
                setEvents(result.events)
                
                // Add to history
                const newEntry: InvocationHistoryType = {
                  id: crypto.randomUUID(),
                  timestamp: Date.now(),
                  functionName,
                  arguments: args,
                  result,
                }
                setHistory([...history, newEntry])
              }}
            />
          </div>

          {/* Right Panel - State & Results */}
          <div className="lg:col-span-1">
            <StatePanel
              ledgerEntries={ledgerEntries}
              setLedgerEntries={setLedgerEntries}
              stateDiff={stateDiff}
              events={events}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stellar-dark text-gray-400 py-4 px-6 mt-12">
        <div className="container mx-auto text-center text-sm">
          <p>
            Built for the Stellar ecosystem •{' '}
            <a
              href="https://github.com/sorosim"
              className="text-stellar-purple hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Source
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
