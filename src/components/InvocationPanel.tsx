import { useState } from 'react'
import ArgumentForm from './ArgumentForm'
import type { ContractFunction, FunctionArgument, SimulationResult, LedgerEntry } from '../types'
import { simulateInvocation } from '../api/simulationApi'

interface InvocationPanelProps {
  selectedFunction: string
  wasmFile: File | null
  contractFunctions: ContractFunction[]
  ledgerEntries: LedgerEntry[]
}

export default function InvocationPanel({
  selectedFunction,
  wasmFile,
  contractFunctions,
  ledgerEntries,
}: InvocationPanelProps) {
  const [isSimulating, setIsSimulating] = useState(false)
  const [functionArguments, setFunctionArguments] = useState<FunctionArgument[]>([])
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [simulationError, setSimulationError] = useState<string | null>(null)

  const selectedFunctionObj = contractFunctions.find(
    f => f.name === selectedFunction
  ) || null

  const handleSimulate = async () => {
    if (!wasmFile || !selectedFunction) {
      setSimulationError('Please upload a WASM file and select a function')
      return
    }

    setIsSimulating(true)
    setSimulationError(null)
    setSimulationResult(null)
    
    try {
      const result = await simulateInvocation({
        wasmFile,
        functionName: selectedFunction,
        arguments: functionArguments,
        ledgerEntries,
      })
      
      setSimulationResult(result)
    } catch (error) {
      setSimulationError(
        error instanceof Error ? error.message : 'Simulation failed'
      )
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Invocation Arguments */}
      <div className="panel">
        <div className="panel-header">Function Arguments</div>
        <div className="panel-content">
          {!selectedFunction ? (
            <p className="text-gray-500 text-sm">
              Upload a contract and select a function to configure arguments
            </p>
          ) : (
            <ArgumentForm
              selectedFunction={selectedFunctionObj}
              onArgumentsChange={setFunctionArguments}
            />
          )}
        </div>
      </div>

      {/* Simulate Button */}
      <div className="panel">
        <div className="panel-content">
          <button
            onClick={handleSimulate}
            disabled={!wasmFile || !selectedFunction || isSimulating}
            className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSimulating ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Simulating...
              </span>
            ) : (
              '▶ Simulate Invocation'
            )}
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            Run contract function with mock ledger state
          </p>
        </div>
      </div>

      {/* Results Preview */}
      <div className="panel">
        <div className="panel-header flex justify-between items-center">
          <span>Invocation Result</span>
          {simulationResult && (
            <span className="text-xs text-gray-500">
              {new Date().toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="panel-content">
          {simulationError && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
              <div className="font-semibold flex items-center gap-2">
                <span className="text-lg">❌</span>
                Simulation Error
              </div>
              <div className="mt-2 font-mono text-xs">{simulationError}</div>
            </div>
          )}

          {simulationResult && (
            <div className="space-y-4">
              {/* Success/Failure Status Banner */}
              <div
                className={`rounded-lg p-4 text-sm font-semibold flex items-center gap-3 ${
                  simulationResult.success
                    ? 'bg-green-50 border-2 border-green-500 text-green-800'
                    : 'bg-red-50 border-2 border-red-500 text-red-800'
                }`}
              >
                <span className="text-2xl">
                  {simulationResult.success ? '✅' : '❌'}
                </span>
                <div>
                  <div className="text-lg">
                    {simulationResult.success ? 'Simulation Successful' : 'Simulation Failed'}
                  </div>
                  <div className="text-xs font-normal opacity-80">
                    Function: <span className="font-mono">{selectedFunction}</span>
                  </div>
                </div>
              </div>

              {/* Return Value Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-gray-700">
                    📦 Return Value
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedFunctionObj?.outputs.join(' | ') || 'unknown'}
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                  <pre className="text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap break-all">
                    {simulationResult.returnValue 
                      ? tryFormatJson(simulationResult.returnValue)
                      : 'void'}
                  </pre>
                </div>
              </div>

              {/* Error Message (if failed) */}
              {simulationResult.error && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    ⚠️ Error Details
                  </div>
                  <div className="bg-red-900 rounded-lg p-3 border border-red-700">
                    <pre className="text-xs font-mono text-red-300 overflow-x-auto whitespace-pre-wrap">
                      {simulationResult.error}
                    </pre>
                  </div>
                </div>
              )}

              {/* Execution Metadata Grid */}
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  📊 Execution Metrics
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-xs text-blue-600 font-medium mb-1">
                      CPU Instructions
                    </div>
                    <div className="text-lg font-bold font-mono text-blue-900">
                      {simulationResult.executionMetadata.cpuInstructions.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-xs text-purple-600 font-medium mb-1">
                      Memory Used
                    </div>
                    <div className="text-lg font-bold font-mono text-purple-900">
                      {formatBytes(simulationResult.executionMetadata.memoryBytes)}
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-medium mb-1">
                      Ledger Reads
                    </div>
                    <div className="text-lg font-bold font-mono text-green-900">
                      {simulationResult.executionMetadata.ledgerReadsCount}
                    </div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="text-xs text-orange-600 font-medium mb-1">
                      Ledger Writes
                    </div>
                    <div className="text-lg font-bold font-mono text-orange-900">
                      {simulationResult.executionMetadata.ledgerWritesCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-600">
                💡 <strong>Summary:</strong> Processed in{' '}
                {simulationResult.executionMetadata.cpuInstructions.toLocaleString()} instructions
                {simulationResult.executionMetadata.ledgerWritesCount > 0 && (
                  <>, modified {simulationResult.executionMetadata.ledgerWritesCount} ledger {simulationResult.executionMetadata.ledgerWritesCount === 1 ? 'entry' : 'entries'}</>
                )}
              </div>
            </div>
          )}

          {!simulationResult && !simulationError && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🚀</div>
              <div className="text-gray-500 text-sm">
                Results will appear here after simulation
              </div>
              <div className="text-gray-400 text-xs mt-1">
                Click "Simulate Invocation" to begin
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to format JSON with fallback
function tryFormatJson(value: string): string {
  try {
    const parsed = JSON.parse(value)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return value
  }
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
