import { describe, it, expect } from 'vitest'
import { parseWasmFile, formatFunctionSignature } from './wasmParser'
import type { ContractFunction } from '../types'

describe('wasmParser', () => {
  describe('parseWasmFile', () => {
    it('throws error for invalid WASM file', async () => {
      const invalidFile = new File(['not wasm'], 'test.wasm', { type: 'application/wasm' })
      await expect(parseWasmFile(invalidFile)).rejects.toThrow(/Invalid WASM file/)
    })

    it('returns mock functions for valid WASM magic number', async () => {
      // Create a file with WASM magic number
      const wasmBytes = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])
      const mockFile = new File([wasmBytes], 'counter.wasm', { type: 'application/wasm' })
      
      const result = await parseWasmFile(mockFile)
      
      expect(Array.isArray(result.functions)).toBe(true)
      expect(result.functions.length).toBeGreaterThan(0)
    })

    it('detects counter contract from filename', async () => {
      const wasmBytes = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])
      const mockFile = new File([wasmBytes], 'counter.wasm', { type: 'application/wasm' })
      
      const result = await parseWasmFile(mockFile)
      const functionNames = result.functions.map(f => f.name)
      
      expect(functionNames).toContain('increment')
      expect(functionNames).toContain('get_count')
    })

    it('detects token contract from filename', async () => {
      const wasmBytes = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])
      const mockFile = new File([wasmBytes], 'token.wasm', { type: 'application/wasm' })
      
      const result = await parseWasmFile(mockFile)
      const functionNames = result.functions.map(f => f.name)
      
      expect(functionNames).toContain('transfer')
      expect(functionNames).toContain('balance')
    })
  })

  describe('formatFunctionSignature', () => {
    it('formats function signature correctly', () => {
      const func: ContractFunction = {
        name: 'transfer',
        inputs: [
          { name: 'from', type: 'Address' },
          { name: 'to', type: 'Address' },
          { name: 'amount', type: 'i128' },
        ],
        outputs: ['Void'],
      }

      const signature = formatFunctionSignature(func)
      
      expect(signature).toBe('transfer(from: Address, to: Address, amount: i128) -> Void')
    })
  })
})
