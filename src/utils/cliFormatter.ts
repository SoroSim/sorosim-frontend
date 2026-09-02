import type { SimulationResult, FunctionArgument } from '../types'

/**
 * Format simulation results to match stellar CLI output
 */
export function formatAsCliOutput(
  functionName: string,
  args: FunctionArgument[],
  result: SimulationResult
): string {
  const lines: string[] = []

  // Header
  lines.push('stellar contract invoke \\')
  lines.push(`  --id C... \\`)
  lines.push(`  --source-account G... \\`)
  lines.push(`  --network testnet \\`)
  lines.push(`  -- \\`)
  lines.push(`  ${functionName} \\`)

  // Arguments
  args.forEach((arg) => {
    lines.push(`  --${arg.name} ${formatArgForCli(arg)} \\`)
  })

  lines.push('')

  // Result
  if (result.success) {
    lines.push('✅ Success')
    lines.push('')
    lines.push('Return Value:')
    lines.push(formatReturnValue(result.returnValue))
    lines.push('')
  } else {
    lines.push('❌ Failed')
    lines.push('')
    if (result.error) {
      lines.push('Error:')
      lines.push(`  ${result.error}`)
      lines.push('')
    }
  }

  // Execution Metadata
  lines.push('Execution Metadata:')
  lines.push(`  CPU Instructions: ${result.executionMetadata.cpuInstructions.toLocaleString()}`)
  lines.push(`  Memory Bytes: ${result.executionMetadata.memoryBytes.toLocaleString()}`)
  lines.push(`  Ledger Reads: ${result.executionMetadata.ledgerReadsCount}`)
  lines.push(`  Ledger Writes: ${result.executionMetadata.ledgerWritesCount}`)
  lines.push('')

  // Events
  if (result.events.length > 0) {
    lines.push(`Events (${result.events.length}):`)
    result.events.forEach((event, index) => {
      lines.push(`  [${index}] Topics: ${event.topics.join(', ')}`)
      if (event.contractId) {
        lines.push(`      Contract: ${event.contractId}`)
      }
      lines.push(`      Data: ${event.data}`)
    })
    lines.push('')
  }

  // State Changes
  if (result.stateDiff.length > 0) {
    lines.push(`State Changes (${result.stateDiff.length}):`)
    result.stateDiff.forEach((diff) => {
      const symbol = diff.type === 'added' ? '+' : diff.type === 'removed' ? '-' : '~'
      lines.push(`  ${symbol} ${diff.key}`)
      if (diff.type === 'modified') {
        lines.push(`      Old: ${diff.oldValue}`)
        lines.push(`      New: ${diff.newValue}`)
      } else if (diff.type === 'added') {
        lines.push(`      Value: ${diff.newValue}`)
      } else if (diff.type === 'removed') {
        lines.push(`      Value: ${diff.oldValue}`)
      }
    })
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Format argument for CLI display
 */
function formatArgForCli(arg: FunctionArgument): string {
  switch (arg.type) {
    case 'String':
      return `"${arg.value}"`
    case 'Address':
      return arg.value
    case 'Bool':
      return arg.value
    case 'i128':
    case 'u128':
    case 'i64':
    case 'u64':
    case 'i32':
    case 'u32':
      return arg.value
    case 'Vec':
    case 'Map':
      return `'${arg.value}'`
    default:
      return arg.value
  }
}

/**
 * Format return value for display
 */
function formatReturnValue(value?: string): string {
  if (!value) return '  (void)'
  
  try {
    const parsed = JSON.parse(value)
    return '  ' + JSON.stringify(parsed, null, 2).split('\n').join('\n  ')
  } catch {
    return `  ${value}`
  }
}

/**
 * Generate equivalent stellar CLI command
 */
export function generateCliCommand(
  functionName: string,
  args: FunctionArgument[],
  contractId: string = 'C...',
  sourceAccount: string = 'G...',
  network: string = 'testnet'
): string {
  const lines: string[] = []

  lines.push('stellar contract invoke \\')
  lines.push(`  --id ${contractId} \\`)
  lines.push(`  --source-account ${sourceAccount} \\`)
  lines.push(`  --network ${network} \\`)
  lines.push(`  -- \\`)
  lines.push(`  ${functionName}${args.length > 0 ? ' \\' : ''}`)

  args.forEach((arg, index) => {
    const isLast = index === args.length - 1
    lines.push(`  --${arg.name} ${formatArgForCli(arg)}${isLast ? '' : ' \\'}`)
  })

  return lines.join('\n')
}

/**
 * Format for soroban-cli (older format)
 */
export function generateSorobanCliCommand(
  functionName: string,
  args: FunctionArgument[],
  wasmPath: string = './contract.wasm'
): string {
  const lines: string[] = []

  lines.push('soroban contract invoke \\')
  lines.push(`  --wasm ${wasmPath} \\`)
  lines.push(`  --id 0 \\`)
  lines.push(`  -- \\`)
  lines.push(`  ${functionName}${args.length > 0 ? ' \\' : ''}`)

  args.forEach((arg, index) => {
    const isLast = index === args.length - 1
    lines.push(`  --${arg.name} ${formatArgForCli(arg)}${isLast ? '' : ' \\'}`)
  })

  return lines.join('\n')
}
