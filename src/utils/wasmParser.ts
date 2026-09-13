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
  
  // Check file size
  if (bytes.length === 0) {
    throw new Error('The uploaded file is empty. Please select a valid WASM file.')
  }
  
  if (bytes.length < 8) {
    throw new Error('File is too small to be a valid WASM file. WASM files must be at least 8 bytes. Did you upload the correct file?')
  }
  
  // Validate WASM magic number (0x00 0x61 0x73 0x6d)
  if (bytes[0] !== 0x00 || 
      bytes[1] !== 0x61 || 
      bytes[2] !== 0x73 || 
      bytes[3] !== 0x6d) {
    
    // Check if it might be a text file
    const firstBytes = String.fromCharCode(...bytes.slice(0, Math.min(100, bytes.length)))
    if (firstBytes.includes('<!DOCTYPE') || firstBytes.includes('<html')) {
      throw new Error('This appears to be an HTML file, not a WASM binary. Please upload a .wasm file compiled from your smart contract.')
    }
    
    if (firstBytes.includes('{') || firstBytes.includes('function')) {
      throw new Error('This appears to be a text or source code file. Please upload a compiled .wasm binary file, not source code.')
    }
    
    throw new Error(
      'Invalid WASM file format. The file does not have the correct WASM magic number. ' +
      'Ensure you are uploading a compiled .wasm file from your Soroban contract build output.'
    )
  }
  
  // Validate WASM version (should be 1)
  if (bytes.length >= 8 && bytes[4] !== 0x01) {
    throw new Error(
      `Unsupported WASM version (${bytes[4]}). Expected version 1. ` +
      'Your WASM file may be corrupted or from an incompatible compiler.'
    )
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
