import { useState, useEffect } from 'react'
import type { ContractFunction, FunctionArgument, ScValType } from '../types'

interface ArgumentFormProps {
  selectedFunction: ContractFunction | null
  onArgumentsChange: (args: FunctionArgument[]) => void
}

const AVAILABLE_TYPES: ScValType[] = [
  'Address',
  'Bool',
  'String',
  'Symbol',
  'i128',
  'u128',
  'i64',
  'u64',
  'i32',
  'u32',
  'Bytes',
  'Vec',
  'Map',
  'Void',
]

export default function ArgumentForm({
  selectedFunction,
  onArgumentsChange,
}: ArgumentFormProps) {
  const [arguments_, setArguments] = useState<FunctionArgument[]>([])
  const [isTypeOverrideEnabled, setIsTypeOverrideEnabled] = useState(false)

  // Initialize arguments when function changes
  useEffect(() => {
    if (selectedFunction) {
      const initialArgs: FunctionArgument[] = selectedFunction.inputs.map(input => ({
        name: input.name,
        type: input.type,
        value: getDefaultValue(input.type),
      }))
      setArguments(initialArgs)
      onArgumentsChange(initialArgs)
    } else {
      setArguments([])
      onArgumentsChange([])
    }
  }, [selectedFunction])

  const handleArgumentChange = (index: number, value: string) => {
    const newArgs = [...arguments_]
    newArgs[index].value = value
    setArguments(newArgs)
    onArgumentsChange(newArgs)
  }

  const handleTypeChange = (index: number, newType: ScValType) => {
    const newArgs = [...arguments_]
    newArgs[index].type = newType
    newArgs[index].value = getDefaultValue(newType)
    setArguments(newArgs)
    onArgumentsChange(newArgs)
  }

  if (!selectedFunction || selectedFunction.inputs.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        This function takes no arguments
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Type Override Toggle */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded p-2">
        <label htmlFor="type-override-toggle" className="text-xs text-blue-800 font-medium">
          Enable Type Override
        </label>
        <input
          id="type-override-toggle"
          type="checkbox"
          checked={isTypeOverrideEnabled}
          onChange={(e) => setIsTypeOverrideEnabled(e.target.checked)}
          className="h-4 w-4 text-stellar-purple focus:ring-stellar-purple border-gray-300 rounded"
        />
      </div>

      {isTypeOverrideEnabled && (
        <div className="bg-yellow-50 border border-yellow-300 rounded p-2 text-xs text-yellow-800">
          ⚠️ Type override is enabled. You can change argument types, but ensure values are valid for the selected type.
        </div>
      )}

      {selectedFunction.inputs.map((input, index) => (
        <div key={`${input.name}-${index}`} className="border border-gray-200 rounded p-3 space-y-3">
          {/* Argument Header */}
          <div className="flex items-start justify-between">
            <div>
              <label htmlFor={`arg-${index}`} className="label mb-0">
                {input.name}
              </label>
              <p className="text-xs text-gray-500">
                Original type: <span className="font-mono">{input.type}</span>
              </p>
            </div>
          </div>

          {/* Type Selector (if override enabled) */}
          {isTypeOverrideEnabled && (
            <div>
              <label htmlFor={`type-${index}`} className="text-xs font-medium text-gray-700 block mb-1">
                Override Type
              </label>
              <select
                id={`type-${index}`}
                value={arguments_[index]?.type || input.type}
                onChange={(e) => handleTypeChange(index, e.target.value as ScValType)}
                className="input-field text-sm"
              >
                {AVAILABLE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Value Input */}
          <div>
            <label htmlFor={`arg-${index}`} className="text-xs font-medium text-gray-700 block mb-1">
              Value
              {isTypeOverrideEnabled && arguments_[index]?.type !== input.type && (
                <span className="ml-2 text-stellar-purple">
                  (using {arguments_[index]?.type})
                </span>
              )}
            </label>
            {renderInputForType(
              arguments_[index]?.type || input.type,
              arguments_[index]?.value || '',
              (value) => handleArgumentChange(index, value),
              `arg-${index}`
            )}
            <p className="mt-1 text-xs text-gray-500">
              {getTypeHint(arguments_[index]?.type || input.type)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function renderInputForType(
  type: ScValType,
  value: string,
  onChange: (value: string) => void,
  id: string
): React.ReactElement {
  switch (type) {
    case 'Bool':
      return (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      )

    case 'Address':
      return (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="G... or C... (Stellar address)"
          className="input-field font-mono text-sm"
        />
      )

    case 'String':
    case 'Symbol':
      return (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={type === 'Symbol' ? 'symbol_name' : 'Enter text'}
          className="input-field"
        />
      )

    case 'i128':
    case 'u128':
    case 'i64':
    case 'u64':
    case 'i32':
    case 'u32':
      return (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={getNumberPlaceholder(type)}
          className="input-field font-mono"
        />
      )

    case 'Bytes':
      return (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0x... (hex bytes)"
          className="input-field font-mono text-sm"
        />
      )

    case 'Vec':
      return (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="[1, 2, 3] (JSON array)"
          rows={3}
          className="input-field font-mono text-sm"
        />
      )

    case 'Map':
      return (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='{"key": "value"} (JSON object)'
          rows={4}
          className="input-field font-mono text-sm"
        />
      )

    case 'Void':
      return (
        <div className="text-sm text-gray-500 italic">
          No input required (void type)
        </div>
      )

    default:
      return (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter value"
          className="input-field"
        />
      )
  }
}

function getDefaultValue(type: ScValType): string {
  switch (type) {
    case 'Bool':
      return 'false'
    case 'Address':
      return ''
    case 'String':
    case 'Symbol':
      return ''
    case 'i128':
    case 'u128':
    case 'i64':
    case 'u64':
    case 'i32':
    case 'u32':
      return '0'
    case 'Bytes':
      return ''
    case 'Vec':
      return '[]'
    case 'Map':
      return '{}'
    case 'Void':
      return ''
    default:
      return ''
  }
}

function getNumberPlaceholder(type: ScValType): string {
  const ranges: Record<string, string> = {
    i128: '-170141183460469231731687303715884105728 to 170141183460469231731687303715884105727',
    u128: '0 to 340282366920938463463374607431768211455',
    i64: '-9223372036854775808 to 9223372036854775807',
    u64: '0 to 18446744073709551615',
    i32: '-2147483648 to 2147483647',
    u32: '0 to 4294967295',
  }
  return ranges[type] || '0'
}

function getTypeHint(type: ScValType): string {
  const hints: Record<ScValType, string> = {
    Address: 'Stellar account (G...) or contract (C...) address',
    i128: 'Signed 128-bit integer',
    u128: 'Unsigned 128-bit integer',
    i64: 'Signed 64-bit integer',
    u64: 'Unsigned 64-bit integer',
    i32: 'Signed 32-bit integer',
    u32: 'Unsigned 32-bit integer',
    Bool: 'Boolean true or false',
    String: 'UTF-8 string value',
    Symbol: 'Symbol identifier (lowercase with underscores)',
    Bytes: 'Hexadecimal byte array (0x...)',
    Vec: 'Array of values in JSON format',
    Map: 'Key-value pairs in JSON format',
    Void: 'No value',
  }
  return hints[type] || 'Custom value'
}
