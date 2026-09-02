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
        <div className="panel-header">Invocation Result</div>
        <div className="panel-content">
          {simulationError && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
              <div className="font-semibold">❌ Simulation Error</div>
              <div className="mt-1">{simulationError}</div>
            </div>
          )}

          {simulationResult && (
            <div className="space-y-3">
              {/* Success/Failure Status */}
              <div
                className={`rounded p-3 text-sm font-semibold ${
                  simulationResult.success
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {simulationResult.success ? '✅ Success' : '❌ Failed'}
              </div>

              {/* Return Value */}
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">
                  Return Value:
                </div>
                <pre className="bg-gray-50 rounded p-2 text-xs font-mono overflow-x-auto">
                  {simulationResult.returnValue || 'void'}
                </pre>
              </div>

              {/* Error Message */}
              {simulationResult.error && (
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">
                    Error:
                  </div>
                  <pre className="bg-red-50 rounded p-2 text-xs font-mono text-red-800 overflow-x-auto">
                    {simulationResult.error}
                  </pre>
                </div>
              )}

              {/* Execution Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-gray-500">CPU Instructions</div>
                  <div className="font-mono font-semibold">
                    {simulationResult.executionMetadata.cpuInstructions.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-gray-500">Memory (bytes)</div>
                  <div className="font-mono font-semibold">
                    {simulationResult.executionMetadata.memoryBytes.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-gray-500">Ledger Reads</div>
                  <div className="font-mono font-semibold">
                    {simulationResult.executionMetadata.ledgerReadsCount}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-gray-500">Ledger Writes</div>
                  <div className="font-mono font-semibold">
                    {simulationResult.executionMetadata.ledgerWritesCount}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!simulationResult && !simulationError && (
            <div className="bg-gray-50 rounded p-4 font-mono text-sm text-gray-500">
              Results will appear here after simulation
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
