import { useState } from 'react'

interface InvocationPanelProps {
  selectedFunction: string
  wasmFile: File | null
}

export default function InvocationPanel({
  selectedFunction,
  wasmFile,
}: InvocationPanelProps) {
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSimulate = async () => {
    if (!wasmFile || !selectedFunction) {
      alert('Please upload a WASM file and select a function')
      return
    }

    setIsSimulating(true)
    
    // Simulate API call delay
    setTimeout(() => {
      setIsSimulating(false)
      alert('Simulation complete! (Backend integration pending)')
    }, 1500)
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
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Function: <span className="font-mono font-semibold">{selectedFunction}</span>
              </p>
              
              {/* Dynamic argument form placeholder */}
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                ⚠️ Dynamic argument form will be implemented in commit #5-6
              </div>
            </div>
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
          <div className="bg-gray-50 rounded p-4 font-mono text-sm text-gray-500">
            Results will appear here after simulation
          </div>
        </div>
      </div>
    </div>
  )
}
