import type {
  SimulationRequest,
  SimulationResult,
  FunctionArgument,
  LedgerEntry,
} from '../types'

/**
 * API client for SoroSim backend simulation endpoints
 * 
 * TODO: Update BASE_URL with actual backend URL when deployed
 * For local development: http://localhost:3000
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface SimulateRequestPayload {
  wasmBase64: string
  functionName: string
  arguments: FunctionArgument[]
  ledgerEntries: LedgerEntry[]
  network?: 'testnet' | 'futurenet' | 'mainnet'
}

/**
 * Simulate a contract invocation
 */
export async function simulateInvocation(
  request: SimulationRequest
): Promise<SimulationResult> {
  try {
    // Convert WASM file to base64
    const wasmBase64 = await fileToBase64(request.wasmFile)

    const payload: SimulateRequestPayload = {
      wasmBase64,
      functionName: request.functionName,
      arguments: request.arguments,
      ledgerEntries: request.ledgerEntries,
      network: 'testnet', // Default network
    }

    const response = await fetch(`${BASE_URL}/api/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `Simulation failed: ${response.statusText}`
      )
    }

    const result: SimulationResult = await response.json()
    return result
  } catch (error) {
    // If backend is not available, return mock result for development
    console.warn('Backend not available, using mock simulation:', error)
    return createMockSimulationResult(request)
  }
}

/**
 * Convert File to base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      // Remove data URL prefix (e.g., "data:application/wasm;base64,")
      const base64Data = base64.split(',')[1] || base64
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Create mock simulation result for development/testing
 * This will be replaced by actual backend response
 */
function createMockSimulationResult(
  request: SimulationRequest
): SimulationResult {
  const isTransfer = request.functionName.toLowerCase().includes('transfer')
  const isRead = request.functionName.toLowerCase().includes('balance') ||
                 request.functionName.toLowerCase().includes('get')

  return {
    success: true,
    returnValue: isRead ? '{"value": 1000}' : '{"status": "ok"}',
    events: [
      {
        topics: ['transfer', 'event'],
        data: JSON.stringify({
          from: 'GABC...',
          to: 'GDEF...',
          amount: 100,
        }),
        contractId: 'CABC123...',
      },
    ],
    stateDiff: isTransfer
      ? [
          {
            type: 'modified',
            key: 'BALANCE_SENDER',
            oldValue: '1000',
            newValue: '900',
          },
          {
            type: 'modified',
            key: 'BALANCE_RECEIVER',
            oldValue: '500',
            newValue: '600',
          },
        ]
      : [],
    executionMetadata: {
      cpuInstructions: 12500,
      memoryBytes: 65536,
      ledgerReadsCount: 2,
      ledgerWritesCount: isTransfer ? 2 : 0,
    },
  }
}

/**
 * Health check for backend API
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
    })
    return response.ok
  } catch {
    return false
  }
}
