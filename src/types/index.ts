// Core Soroban ScVal types that will be used throughout the app

export type ScValType =
  | 'Address'
  | 'i128'
  | 'u128'
  | 'i64'
  | 'u64'
  | 'i32'
  | 'u32'
  | 'Bool'
  | 'String'
  | 'Symbol'
  | 'Bytes'
  | 'Vec'
  | 'Map'
  | 'Void'

export interface ContractFunction {
  name: string
  inputs: FunctionInput[]
  outputs: ScValType[]
}

export interface FunctionInput {
  name: string
  type: ScValType
}

export interface FunctionArgument {
  name: string
  type: ScValType
  value: string
}

export interface LedgerEntry {
  id: string
  type: LedgerEntryType
  data: unknown
}

export type LedgerEntryType =
  | 'Account'
  | 'ContractData'
  | 'ContractCode'
  | 'Trustline'

export interface AccountEntry {
  accountId: string
  balance: string
  sequence: string
}

export interface ContractDataEntry {
  contractId: string
  key: string
  value: string
  durability: 'Temporary' | 'Persistent'
}

export interface ContractCodeEntry {
  hash: string
  wasmBytes: Uint8Array
}

export interface SimulationRequest {
  wasmFile: File
  functionName: string
  arguments: FunctionArgument[]
  ledgerEntries: LedgerEntry[]
}

export interface SimulationResult {
  success: boolean
  returnValue?: string
  error?: string
  events: ContractEvent[]
  stateDiff: StateDiff[]
  executionMetadata: ExecutionMetadata
}

export interface ContractEvent {
  topics: string[]
  data: string
  contractId?: string
}

export interface StateDiff {
  type: 'added' | 'modified' | 'removed'
  key: string
  oldValue?: string
  newValue?: string
}

export interface ExecutionMetadata {
  cpuInstructions: number
  memoryBytes: number
  ledgerReadsCount: number
  ledgerWritesCount: number
}

export interface InvocationHistory {
  id: string
  timestamp: number
  functionName: string
  arguments: FunctionArgument[]
  result: SimulationResult
}

export interface SessionState {
  wasmFile?: File
  ledgerEntries: LedgerEntry[]
  history: InvocationHistory[]
  settings: AppSettings
}

export interface AppSettings {
  rpcEndpoint: string
  network: 'testnet' | 'futurenet' | 'mainnet'
  theme: 'light' | 'dark'
}

// Preset contracts
export interface ContractPreset {
  id: string
  name: string
  description: string
  wasmUrl: string
  sampleLedgerState: LedgerEntry[]
  sampleInvocations: {
    functionName: string
    arguments: FunctionArgument[]
  }[]
}
