import { useRef, useState } from 'react'

interface ContractPanelProps {
  wasmFile: File | null
  setWasmFile: (file: File | null) => void
  contractFunctions: string[]
  setContractFunctions: (functions: string[]) => void
  selectedFunction: string
  setSelectedFunction: (fn: string) => void
}

export default function ContractPanel({
  wasmFile,
  setWasmFile,
  contractFunctions,
  setContractFunctions,
  selectedFunction,
  setSelectedFunction,
}: ContractPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.wasm')) {
      alert('Please upload a valid .wasm file')
      return
    }

    setWasmFile(file)
    
    // Mock function discovery - in real implementation, parse WASM
    // For now, simulate contract entry points
    const mockFunctions = ['initialize', 'transfer', 'balance', 'approve', 'allowance']
    setContractFunctions(mockFunctions)
    setSelectedFunction(mockFunctions[0])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file) {
          await handleFileSelect(file)
          break
        }
      }
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">Contract Upload</div>
      <div className="panel-content space-y-4">
        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-stellar-purple bg-purple-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onPaste={handlePaste}
          tabIndex={0}
          role="button"
          aria-label="Upload WASM file"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".wasm"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="File input for WASM upload"
          />
          
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          <p className="mt-2 text-sm text-gray-600">
            {wasmFile ? (
              <span className="font-medium text-stellar-purple">{wasmFile.name}</span>
            ) : (
              <>
                <span className="font-medium">Drop WASM file here</span>
                <br />
                or paste from clipboard
              </>
            )}
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 btn-secondary"
          >
            Browse Files
          </button>
        </div>

        {/* Function Selector */}
        {contractFunctions.length > 0 && (
          <div>
            <label htmlFor="function-select" className="label">
              Contract Function
            </label>
            <select
              id="function-select"
              value={selectedFunction}
              onChange={(e) => setSelectedFunction(e.target.value)}
              className="input-field"
            >
              {contractFunctions.map((fn) => (
                <option key={fn} value={fn}>
                  {fn}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Contract Info */}
        {wasmFile && (
          <div className="bg-gray-50 rounded p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">File Size:</span>
              <span className="font-medium">
                {(wasmFile.size / 1024).toFixed(2)} KB
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-600">Functions Found:</span>
              <span className="font-medium">{contractFunctions.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
