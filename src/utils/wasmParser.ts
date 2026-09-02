/**
 * WASM Parser Utilities
 * For now, this returns mock data. In production, this would:
 * 1. Parse the WASM binary to extract contract spec
 * 2. Use stellar-sdk to decode contract metadata
 * 3. Extract function signatures with parameter types
 */

import type { ContractFunction } from '../types'

export interface WasmParseResult {
  functions: ContractFunction[]
  contractName?: string
  version?: string
}

/**
 * Parse WASM file to extract contract functions
 * TODO: Integrate with stellar-sdk for real WASM parsing
 */
export async function parseWasmFile(file: File): Promise<WasmParseResult> {
  // Read file as ArrayBuffer
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  
  // Validate WASM magic number (0x00 0x61 0x73 0x6d)
  if (bytes.length < 4 || 
      bytes[0] !== 0x00 || 
      bytes[1] !== 0x61 || 
      bytes[2] !== 0x73 || 
      bytes[3] !== 0x6d) {
    throw new Error('Invalid WASM file: magic number mismatch')
  }
  
  // Mock contract functions based on common Soroban patterns
  // In production, this would parse the actual contract spec
  const mockFunctions = generateMockFunctions(file.name)
  
  return {
    functions: mockFunctions,
    contractName: extractContractName(file.name),
    version: '1.0.0',
  }
}

function extractContractName(filename: string): string {
  // Remove .wasm extension and clean up
  return filename
    .replace(/\.wasm$/, '')
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function generateMockFunctions(filename: string): ContractFunction[] {
  // Detect contract type from filename
  const name = filename.toLowerCase()
  
  if (name.includes('token')) {
    return getTokenContractFunctions()
  } else if (name.includes('counter')) {
    return getCounterContractFunctions()
  } else if (name.includes('vote') || name.includes('voting')) {
    return getVotingContractFunctions()
  } else if (name.includes('nft')) {
    return getNFTContractFunctions()
  } else {
    return getGenericContractFunctions()
  }
}

function getTokenContractFunctions(): ContractFunction[] {
  return [
    {
      name: 'initialize',
      inputs: [
        { name: 'admin', type: 'Address' },
        { name: 'decimal', type: 'u32' },
        { name: 'name', type: 'String' },
        { name: 'symbol', type: 'String' },
      ],
      outputs: ['Void'],
    },
    {
      name: 'mint',
      inputs: [
        { name: 'to', type: 'Address' },
        { name: 'amount', type: 'i128' },
      ],
      outputs: ['Void'],
    },
    {
      name: 'transfer',
      inputs: [
        { name: 'from', type: 'Address' },
        { name: 'to', type: 'Address' },
        { name: 'amount', type: 'i128' },
      ],
      outputs: ['Void'],
    },
    {
      name: 'balance',
      inputs: [
        { name: 'id', type: 'Address' },
      ],
      outputs: ['i128'],
    },
    {
      name: 'approve',
      inputs: [
        { name: 'from', type: 'Address' },
        { name: 'spender', type: 'Address' },
        { name: 'amount', type: 'i128' },
        { name: 'expiration_ledger', type: 'u32' },
      ],
      outputs: ['Void'],
    },
    {
      name: 'allowance',
      inputs: [
        { name: 'from', type: 'Address' },
        { name: 'spender', type: 'Address' },
      ],
      outputs: ['i128'],
    },
  ]
}

function getCounterContractFunctions(): ContractFunction[] {
  return [
    {
      name: 'increment',
      inputs: [],
      outputs: ['u32'],
    },
    {
      name: 'decrement',
      inputs: [],
      outputs: ['u32'],
    },
    {
      name: 'get_count',
      inputs: [],
      outputs: ['u32'],
    },
    {
      name: 'reset',
      inputs: [],
      outputs: ['Void'],
    },
  ]
}

function getVotingContractFunctions(): ContractFunction[] {
  return [
    {
      name: 'initialize',
      inputs: [
        { name: 'admin', type: 'Address' },
        { name: 'title', type: 'String' },
      ],
      outputs: ['Void'],
    },
    {
      name: 'vote',
      inputs: [
        { name: 'voter', type: 'Address' },
        { name: 'option', type: 'u32' },
      ],
      outputs: ['Void'],
    },
    {
      name: 'get_results',
      inputs: [],
      outputs: ['Map'],
    },
    {
      name: 'close_voting',
      inputs: [
        { name: 'admin', type: 'Address' },
      ],
      outputs: ['Void'],
    },
  ]
}

function getNFTContractFunctions(): ContractFunction[] {
  return [
    {
      name: 'mint',
      inputs: [
        { name: 'to', type: 'Address' },
        { name: 'token_id', type: 'u64' },
        { name: 'metadata', type: 'String' },
      ],
      outputs: ['Void'],
    },
    {
      name: 'transfer',
      inputs: [
        { name: 'from', type: 'Address' },
        { name: 'to', type: 'Address' },
        { name: 'token_id', type: 'u64' },
      ],
      outputs: ['Void'],
    },
    {
      name: 'owner_of',
      inputs: [
        { name: 'token_id', type: 'u64' },
      ],
      outputs: ['Address'],
    },
    {
      name: 'metadata',
      inputs: [
        { name: 'token_id', type: 'u64' },
      ],
      outputs: ['String'],
    },
  ]
}

function getGenericContractFunctions(): ContractFunction[] {
  return [
    {
      name: 'initialize',
      inputs: [
        { name: 'admin', type: 'Address' },
      ],
      outputs: ['Void'],
    },
    {
      name: 'invoke',
      inputs: [
        { name: 'caller', type: 'Address' },
        { name: 'data', type: 'Bytes' },
      ],
      outputs: ['Bytes'],
    },
  ]
}

/**
 * Format function signature for display
 */
export function formatFunctionSignature(func: ContractFunction): string {
  const inputs = func.inputs.map(i => `${i.name}: ${i.type}`).join(', ')
  const outputs = func.outputs.join(' | ')
  return `${func.name}(${inputs}) -> ${outputs}`
}
