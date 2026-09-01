import { useState } from 'react'
import ContractPanel from './components/ContractPanel'
import InvocationPanel from './components/InvocationPanel'
import StatePanel from './components/StatePanel'

function App() {
  const [wasmFile, setWasmFile] = useState<File | null>(null)
  const [contractFunctions, setContractFunctions] = useState<string[]>([])
  const [selectedFunction, setSelectedFunction] = useState<string>('')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-stellar-dark text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">
            <span className="text-stellar-purple">Soro</span>Sim
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Soroban Contract Simulation & Dry-Run Sandbox
          </p>
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
            />
          </div>

          {/* Middle Panel - Invocation & Arguments */}
          <div className="lg:col-span-1">
            <InvocationPanel
              selectedFunction={selectedFunction}
              wasmFile={wasmFile}
            />
          </div>

          {/* Right Panel - State & Results */}
          <div className="lg:col-span-1">
            <StatePanel />
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
