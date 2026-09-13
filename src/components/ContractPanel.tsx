import { useRef, useState } from 'react'
import { parseWasmFile, formatFunctionSignature } from '../utils/wasmParser'
import ContractPresetLoader from './ContractPresetLoader'
import WasmLoadingSkeleton from './WasmLoadingSkeleton'
import type { ContractFunction, ContractPreset } from '../types'

interface ContractPanelProps {
  wasmFile: File | null
  setWasmFile: (file: File | null) => void
  contractFunctions: string[]
  setContractFunctions: (functions: string[]) => void
  selectedFunction: string
  setSelectedFunction: (fn: string) => void
  setParsedFunctions: (functions: ContractFunction[]) => void
  onPresetLoad?: (preset: ContractPreset) => void
}

export default function ContractPanel({
  wasmFile,
  setWasmFile,
  contractFunctions,
  setContractFunctions,
  selectedFunction,
  setSelectedFunction,
  setParsedFunctions,
  onPresetLoad,
}: ContractPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localParsedFunctions, setLocalParsedFunctions] = useState<ContractFunction[]>([])
  const [contractName, setContractName] = useState<string>('')
  const [functionSearch, setFunctionSearch] = useState<string>('')

  // Filter functions based on search query
  const filteredFunctions = contractFunctions.filter((fn) =>
    fn.toLowerCase().includes(functionSearch.toLowerCase())
  )

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.wasm')) {
      setError('Please upload a valid .wasm file')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // Parse WASM file to extract functions
      const result = await parseWasmFile(file)
      
      setWasmFile(file)
      setLocalParsedFunctions(result.functions)
      setParsedFunctions(result.functions)
      setContractName(result.contractName || file.name)
      
      const functionNames = result.functions.map(f => f.name)
      setContractFunctions(functionNames)
      setSelectedFunction(functionNames[0] || '')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse WASM file')
      setWasmFile(null)
      setLocalParsedFunctions([])
      setParsedFunctions([])
      setContractFunctions([])
    } finally {
      setIsLoading(false)
    }
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
          
          {isLoading ? (
            <div className="flex flex-col items-center">
              <svg
                className="animate-spin h-12 w-12 text-stellar-purple"
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
              <p className="mt-2 text-sm text-gray-600">Parsing WASM...</p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-start">
              <svg 
                className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                  Upload Failed
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
                <div className="mt-3 text-xs text-red-600 dark:text-red-400">
                  <p className="font-medium mb-1">💡 Troubleshooting tips:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Ensure the file has a .wasm extension</li>
                    <li>Verify the file was compiled with soroban-sdk</li>
                    <li>Try rebuilding your contract with: <code className="bg-red-100 dark:bg-red-800 px-1 rounded">soroban contract build</code></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <WasmLoadingSkeleton count={6} />
        )}

        {/* Contract Name */}
        {contractName && !isLoading && (
          <div className="bg-stellar-purple bg-opacity-10 border border-stellar-purple rounded p-3">
            <p className="text-sm font-semibold text-stellar-purple">
              📄 {contractName}
            </p>
          </div>
        )}

        {/* Function Selector */}
        {contractFunctions.length > 0 && !isLoading && (
          <div>
            <label htmlFor="function-search" className="label">
              Search Functions
            </label>
            <input
              id="function-search"
              type="text"
              value={functionSearch}
              onChange={(e) => setFunctionSearch(e.target.value)}
              placeholder="Type to filter functions..."
              className="input-field mb-3"
              aria-label="Search contract functions"
            />
            
            {filteredFunctions.length === 0 && functionSearch && (
              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded p-2 mb-3 text-xs text-yellow-800 dark:text-yellow-200">
                No functions match "{functionSearch}"
              </div>
            )}
            
            <label htmlFor="function-select" className="label">
              Contract Function {filteredFunctions.length !== contractFunctions.length && (
                <span className="text-gray-500">({filteredFunctions.length} of {contractFunctions.length})</span>
              )}
            </label>
            <select
              id="function-select"
              value={selectedFunction}
              onChange={(e) => setSelectedFunction(e.target.value)}
              className="input-field"
            >
              {filteredFunctions.map((fn) => (
                <option key={fn} value={fn}>
                  {fn}
                </option>
              ))}
            </select>
            
            {/* Function Signature Display */}
            {selectedFunction && localParsedFunctions.length > 0 && (
              <div className="mt-2 bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-500 mb-1">Signature:</p>
                <code className="text-xs font-mono text-gray-700">
                  {formatFunctionSignature(
                    localParsedFunctions.find(f => f.name === selectedFunction)!
                  )}
                </code>
              </div>
            )}
          </div>
        )}

        {/* Contract Info */}
        {wasmFile && !isLoading && (
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

        {/* Preset Loader */}
        <div className="mt-4">
          <ContractPresetLoader
            onLoadPreset={(preset) => {
              if (onPresetLoad) {
                onPresetLoad(preset)
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
