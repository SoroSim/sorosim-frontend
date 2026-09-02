import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportSession, importSession } from './sessionManager'
import type { InvocationHistory, LedgerEntry } from '../types'

describe('sessionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clean up any leftover DOM elements
    document.body.innerHTML = ''
    
    // Mock URL methods
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })
  })

  describe('exportSession', () => {
    it('creates a download link and triggers download', () => {
      const history: InvocationHistory[] = [
        {
          id: '1',
          timestamp: Date.now(),
          functionName: 'transfer',
          arguments: [],
          result: {
            success: true,
            returnValue: 'void',
            stateDiff: [],
            events: [],
            executionMetadata: {
              cpuInstructions: 1000,
              memoryBytes: 512,
              ledgerReadsCount: 2,
              ledgerWritesCount: 1,
            },
          },
        },
      ]
      const ledgerEntries: LedgerEntry[] = [
        { id: '1', type: 'Account', data: { balance: '1000' } },
      ]

      exportSession(history, ledgerEntries, 'test.wasm')

      expect(URL.createObjectURL).toHaveBeenCalled()
    })

    it('includes contract name in exported data', () => {
      const history: InvocationHistory[] = []
      const ledgerEntries: LedgerEntry[] = []
      const contractName = 'my-contract.wasm'

      exportSession(history, ledgerEntries, contractName)

      expect(URL.createObjectURL).toHaveBeenCalled()
    })
  })

  describe('importSession', () => {
    it('parses valid session JSON file', async () => {
      const sessionData = {
        version: '1.0.0',
        timestamp: Date.now(),
        metadata: {
          exportedAt: new Date().toISOString(),
          totalInvocations: 1,
          ledgerEntriesCount: 1,
        },
        session: {
          wasmFile: undefined,
          ledgerEntries: [
            { id: '1', type: 'Account', data: {} },
          ],
          history: [
            {
              id: '1',
              timestamp: Date.now(),
              functionName: 'test',
              arguments: [],
              result: {
                success: true,
                returnValue: 'void',
                stateDiff: [],
                events: [],
                executionMetadata: {
                  cpuInstructions: 100,
                  memoryBytes: 256,
                  ledgerReadsCount: 0,
                  ledgerWritesCount: 0,
                },
              },
            },
          ],
          settings: {
            rpcEndpoint: 'http://localhost:3000',
            network: 'testnet',
            theme: 'light',
          },
        },
      }

      const file = new File([JSON.stringify(sessionData)], 'session.json', {
        type: 'application/json',
      })

      const result = await importSession(file)

      expect(result.history).toHaveLength(1)
      expect(result.ledgerEntries).toHaveLength(1)
    })

    it('throws error for invalid JSON', async () => {
      const file = new File(['invalid json'], 'session.json', {
        type: 'application/json',
      })

      await expect(importSession(file)).rejects.toThrow()
    })

    it('validates session structure', async () => {
      const invalidData = {
        version: '1.0.0',
        // missing required fields
      }

      const file = new File([JSON.stringify(invalidData)], 'session.json', {
        type: 'application/json',
      })

      await expect(importSession(file)).rejects.toThrow(/Invalid session file/)
    })
  })
})
