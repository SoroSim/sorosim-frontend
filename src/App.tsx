import { useState, useEffect } from 'react'
import ContractPanel from './components/ContractPanel'
import InvocationPanel from './components/InvocationPanel'
import StatePanel from './components/StatePanel'
import InvocationHistory from './components/InvocationHistory'
import SettingsPanel from './components/SettingsPanel'
import ShareSessionButton from './components/ShareSessionButton'
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal'
import { exportSession, importSession } from './utils/sessionManager'
import { decodeSessionFromUrl, hasSessionInUrl, clearSessionFromUrl } from './utils/urlStateManager'
import type { 
  ContractFunction, 
  LedgerEntry, 
  StateDiff, 
  ContractEvent, 
  InvocationHistory as InvocationHistoryType,
  ContractPreset,
  AppSettings,
} from './types'

const SETTINGS_STORAGE_KEY = 'sorosim-settings'

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
  const [showSettings, setShowSettings] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [sessionLoadedFromUrl, setSessionLoadedFromUrl] = useState(false)
  const [settings, setSettings] = useState<AppSettings>({
    rpcEndpoint: 'https://soroban-testnet.stellar.org',
    network: 'testnet',
    theme: 'light',
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AppSettings
        setSettings(parsed)
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
  }, [])

  // Apply theme to document body
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.theme])

  // Load session from URL on mount
  useEffect(() => {
    if (hasSessionInUrl()) {
      const sessionState = decodeSessionFromUrl()
      if (sessionState) {
        setLedgerEntries(sessionState.ledgerEntries)
        if (sessionState.selectedFunction) {
          setSelectedFunction(sessionState.selectedFunction)
        }
        setSessionLoadedFromUrl(true)
        
        // Clear URL parameter to keep URL clean
        clearSessionFromUrl()
        
        // Show notification
        alert(
          '✓ Session loaded from URL!\n\n' +
          `Ledger entries: ${sessionState.ledgerEntries.length}\n` +
          (sessionState.selectedFunction ? `Function: ${sessionState.selectedFunction}\n` : '') +
          '\nPlease upload the WASM file to continue.'
        )
      }
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K: Toggle settings
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSettings(prev => !prev)
      }
      
      // Ctrl+H or Cmd+H: Toggle history
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setShowHistory(prev => !prev)
      }

      // ? or Ctrl+/ or Cmd+/: Show keyboard shortcuts
      if (e.key === '?' || ((e.ctrlKey || e.metaKey) && e.key === '/')) {
        e.preventDefault()
        setShowShortcuts(true)
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        setShowSettings(false)
        setShowShortcuts(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings)
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings))
  }

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

  const handlePresetLoad = (preset: ContractPreset) => {
    // Load sample ledger state
    setLedgerEntries(preset.sampleLedgerState)
    
    // Show info message
    alert(
      `Loaded preset: ${preset.name}\n\n` +
      `✓ ${preset.sampleLedgerState.length} ledger entries loaded\n` +
      `✓ ${preset.sampleInvocations.length} sample invocations available\n\n` +
      `Note: Please upload the actual WASM file to continue.`
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-stellar-purple focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-stellar-dark dark:bg-gray-950 text-white py-3 md:py-4 px-4 md:px-6 shadow-lg" role="banner">
        <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              <span className="text-stellar-purple">Soro</span>Sim
            </h1>
            <p className="text-gray-400 text-xs md:text-sm mt-1">
              Soroban Contract Simulation & Dry-Run Sandbox
            </p>
          </div>
          
          {/* Header Actions */}
          <nav aria-label="Main navigation">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {/* Network Badge */}
              <div 
                className="bg-gray-700 px-2 md:px-3 py-1 rounded text-xs font-medium"
                role="status"
                aria-label={`Current network: ${settings.network}`}
              >
                🌐 {settings.network.charAt(0).toUpperCase() + settings.network.slice(1)}
              </div>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 md:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-xs md:text-sm font-medium transition-colors touch-manipulation"
                aria-label="Open settings"
              >
                ⚙️ Settings
              </button>

              {/* Help Button */}
              <button
                onClick={() => setShowShortcuts(true)}
                className="px-3 md:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-xs md:text-sm font-medium transition-colors touch-manipulation"
                aria-label="Show keyboard shortcuts"
                title="Keyboard shortcuts (?)"
              >
                ❓ Help
              </button>

              {/* Import Session */}
              <label
                htmlFor="import-session"
                className="cursor-pointer px-3 md:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-xs md:text-sm font-medium transition-colors touch-manipulation"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    document.getElementById('import-session')?.click()
                  }
                }}
              >
                📂 Import
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
                aria-label="Import session from JSON file"
              />
            </div>
          </nav>
        </div>
      </header>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Main Content - 3 Panel Layout */}
      <main id="main-content" className="container mx-auto p-4 md:p-6" role="main">
        {/* Responsive Grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Panel - Contract Upload & Configuration */}
          <section aria-label="Contract configuration" className="md:col-span-2 lg:col-span-1">
            <ContractPanel
              wasmFile={wasmFile}
              setWasmFile={setWasmFile}
              contractFunctions={contractFunctions}
              setContractFunctions={setContractFunctions}
              selectedFunction={selectedFunction}
              setSelectedFunction={setSelectedFunction}
              setParsedFunctions={setParsedFunctions}
              onPresetLoad={handlePresetLoad}
            />
            
            {/* History Toggle Button */}
            <div className="mt-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`w-full px-4 py-2.5 md:py-2 rounded-md font-medium transition-colors touch-manipulation ${
                  showHistory
                    ? 'bg-stellar-purple text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-expanded={showHistory}
                aria-controls="invocation-history"
                aria-label={`${showHistory ? 'Hide' : 'Show'} invocation history with ${history.length} entries`}
              >
                {showHistory ? '📋 Hide' : '📜 Show'} History ({history.length})
              </button>
            </div>

            {/* Share Session Button */}
            <div className="mt-2">
              <ShareSessionButton
                state={{
                  ledgerEntries,
                  selectedFunction: selectedFunction || undefined,
                  contractName: wasmFile?.name,
                }}
                disabled={ledgerEntries.length === 0}
              />
            </div>

            {sessionLoadedFromUrl && (
              <div 
                className="mt-2 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded p-2 text-xs text-green-800 dark:text-green-200"
                role="status"
                aria-live="polite"
              >
                ✓ Session loaded from shared URL
              </div>
            )}

            {/* History Sidebar */}
            {showHistory && (
              <aside 
                id="invocation-history"
                className="mt-4 panel"
                aria-label="Invocation history"
              >
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
              </aside>
            )}
          </section>

          {/* Middle Panel - Invocation & Arguments */}
          <section aria-label="Function invocation" className="lg:col-span-1">
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
          </section>

          {/* Right Panel - State & Results */}
          <section aria-label="Simulation results and state" className="lg:col-span-1">
            <StatePanel
              ledgerEntries={ledgerEntries}
              setLedgerEntries={setLedgerEntries}
              stateDiff={stateDiff}
              events={events}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stellar-dark dark:bg-gray-950 text-gray-400 py-4 px-6 mt-12" role="contentinfo">
        <div className="container mx-auto text-center text-sm">
          <p>
            Built for the Stellar ecosystem •{' '}
            <a
              href="https://github.com/sorosim"
              className="text-stellar-purple hover:underline focus:outline-none focus:ring-2 focus:ring-stellar-purple focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit SoroSim on GitHub (opens in new tab)"
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
