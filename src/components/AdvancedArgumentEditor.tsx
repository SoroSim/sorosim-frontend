import { useState } from 'react'
import Editor from '@monaco-editor/react'
import type { ContractFunction, FunctionArgument } from '../types'

interface AdvancedArgumentEditorProps {
  selectedFunction: ContractFunction | null
  onArgumentsChange: (args: FunctionArgument[]) => void
}

type EditorMode = 'json' | 'xdr'

export default function AdvancedArgumentEditor({
  selectedFunction,
  onArgumentsChange,
}: AdvancedArgumentEditorProps) {
  const [mode, setMode] = useState<EditorMode>('json')
  const [jsonValue, setJsonValue] = useState('')
  const [xdrValue, setXdrValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!selectedFunction) {
    return (
      <div className="text-sm text-gray-500">
        Select a function to configure arguments
      </div>
    )
  }

  const handleJsonChange = (value: string | undefined) => {
    if (!value) return
    setJsonValue(value)
    setError(null)

    try {
      const parsed = JSON.parse(value)
      
      // Validate structure
      if (!Array.isArray(parsed)) {
        setError('JSON must be an array of arguments')
        return
      }

      // Convert to FunctionArgument format
      const args: FunctionArgument[] = parsed.map((item, index) => {
        const expectedInput = selectedFunction.inputs[index]
        return {
          name: item.name || expectedInput?.name || `arg${index}`,
          type: item.type || expectedInput?.type || 'String',
          value: String(item.value || ''),
        }
      })

      onArgumentsChange(args)
    } catch (err) {
      setError('Invalid JSON format')
    }
  }

  const handleXdrChange = (value: string | undefined) => {
    if (!value) return
    setXdrValue(value)
    setError(null)

    // TODO: Implement XDR parsing with stellar-sdk
    // For now, just store the raw XDR string
    setError('XDR parsing not yet implemented. Use JSON mode for now.')
  }

  const getPlaceholderJson = (): string => {
    const example = selectedFunction.inputs.map(input => ({
      name: input.name,
      type: input.type,
      value: getExampleValue(input.type),
    }))
    return JSON.stringify(example, null, 2)
  }

  const getPlaceholderXdr = (): string => {
    return [
      '// XDR-encoded ScVal arguments',
      '// Each line represents one argument',
      '// Example:',
      'AAAAEQAAAAEAAAACAAAADwAAAAdBY2NvdW50AAAAAAAA...',
      'AAAAAwAAAAo=',
    ].join('\n')
  }

  return (
    <div className="space-y-3">
      {/* Mode Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Input Mode:</span>
        <div className="flex gap-1 bg-gray-100 rounded p-1">
          <button
            onClick={() => setMode('json')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              mode === 'json'
                ? 'bg-white text-stellar-purple shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            JSON
          </button>
          <button
            onClick={() => setMode('xdr')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              mode === 'xdr'
                ? 'bg-white text-stellar-purple shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            XDR
          </button>
        </div>
      </div>

      {/* Function Signature */}
      <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs">
        <span className="text-gray-600">Function:</span>{' '}
        <code className="font-mono text-gray-900 font-semibold">
          {selectedFunction.name}
        </code>
        <span className="text-gray-400 mx-1">→</span>
        <span className="text-gray-600">
          {selectedFunction.outputs.join(' | ')}
        </span>
      </div>

      {/* Monaco Editor */}
      <div className="border border-gray-300 rounded overflow-hidden">
        <Editor
          height="300px"
          language={mode === 'json' ? 'json' : 'plaintext'}
          theme="vs-dark"
          value={mode === 'json' ? jsonValue : xdrValue}
          onChange={mode === 'json' ? handleJsonChange : handleXdrChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
          loading={
            <div className="flex items-center justify-center h-[300px] bg-gray-900 text-gray-400">
              Loading editor...
            </div>
          }
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800">
          ⚠️ {error}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
        <div className="font-semibold mb-1">💡 {mode === 'json' ? 'JSON' : 'XDR'} Format Guide:</div>
        {mode === 'json' ? (
          <div>
            <p className="mb-1">Provide arguments as a JSON array:</p>
            <pre className="bg-blue-100 rounded p-2 mt-1 overflow-x-auto">
              {getPlaceholderJson()}
            </pre>
          </div>
        ) : (
          <div>
            <p className="mb-1">Provide XDR-encoded ScVal arguments (base64):</p>
            <pre className="bg-blue-100 rounded p-2 mt-1 overflow-x-auto font-mono text-xs">
              {getPlaceholderXdr()}
            </pre>
            <p className="mt-2 text-red-700">
              ⚠️ XDR parsing requires stellar-sdk integration (coming soon)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function getExampleValue(type: string): string {
  switch (type) {
    case 'Address':
      return 'GABC123DEFGHIJKLMNOPQRSTUVWXYZ456789ABCDEFGHIJKLMNOPQR'
    case 'Bool':
      return 'true'
    case 'i128':
    case 'u128':
    case 'i64':
    case 'u64':
    case 'i32':
    case 'u32':
      return '1000'
    case 'String':
      return 'example'
    case 'Symbol':
      return 'my_symbol'
    case 'Bytes':
      return '0x1234567890abcdef'
    case 'Vec':
      return '[1, 2, 3]'
    case 'Map':
      return '{"key": "value"}'
    default:
      return ''
  }
}
