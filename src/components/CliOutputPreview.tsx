import { useState } from 'react'
import { formatAsCliOutput, generateCliCommand, generateSorobanCliCommand } from '../utils/cliFormatter'
import { copyUrlToClipboard } from '../utils/urlStateManager'
import type { SimulationResult, FunctionArgument } from '../types'

interface CliOutputPreviewProps {
  functionName: string
  args: FunctionArgument[]
  result: SimulationResult | null
  wasmFileName?: string
}

type CliMode = 'output' | 'command' | 'soroban'

export default function CliOutputPreview({
  functionName,
  args,
  result,
  wasmFileName,
}: CliOutputPreviewProps) {
  const [mode, setMode] = useState<CliMode>('output')
  const [copied, setCopied] = useState(false)

  if (!result) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Run a simulation to see CLI output
      </div>
    )
  }

  const handleCopy = async () => {
    let content = ''
    
    switch (mode) {
      case 'output':
        content = formatAsCliOutput(functionName, args, result)
        break
      case 'command':
        content = generateCliCommand(functionName, args)
        break
      case 'soroban':
        content = generateSorobanCliCommand(functionName, args, wasmFileName || './contract.wasm')
        break
    }

    const success = await copyUrlToClipboard(content)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  let content = ''
  switch (mode) {
    case 'output':
      content = formatAsCliOutput(functionName, args, result)
      break
    case 'command':
      content = generateCliCommand(functionName, args)
      break
    case 'soroban':
      content = generateSorobanCliCommand(functionName, args, wasmFileName || './contract.wasm')
      break
  }

  return (
    <div className="space-y-2">
      {/* Mode Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded p-1">
          <button
            onClick={() => setMode('output')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              mode === 'output'
                ? 'bg-white text-stellar-purple shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Full Output
          </button>
          <button
            onClick={() => setMode('command')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              mode === 'command'
                ? 'bg-white text-stellar-purple shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            stellar-cli
          </button>
          <button
            onClick={() => setMode('soroban')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              mode === 'soroban'
                ? 'bg-white text-stellar-purple shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            soroban-cli
          </button>
        </div>

        <button
          onClick={handleCopy}
          className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>

      {/* CLI Output Display */}
      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <pre className="text-xs font-mono text-green-400 whitespace-pre">
          {content}
        </pre>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
        {mode === 'output' && (
          <span>
            💡 This shows the complete output as it would appear in stellar CLI
          </span>
        )}
        {mode === 'command' && (
          <span>
            💡 Copy this command to run the same invocation with <code className="bg-blue-100 px-1 rounded">stellar contract invoke</code>
          </span>
        )}
        {mode === 'soroban' && (
          <span>
            💡 Legacy <code className="bg-blue-100 px-1 rounded">soroban-cli</code> command format (for older versions)
          </span>
        )}
      </div>
    </div>
  )
}
