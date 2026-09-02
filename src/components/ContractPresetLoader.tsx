import { useState } from 'react'
import type { ContractPreset } from '../types'

interface ContractPresetLoaderProps {
  onLoadPreset: (preset: ContractPreset) => void
}

// Built-in contract presets with sample data
const PRESETS: ContractPreset[] = [
  {
    id: 'counter',
    name: 'Counter Contract',
    description: 'Simple counter with increment/decrement operations',
    wasmUrl: '/presets/counter.wasm',
    sampleLedgerState: [
      {
        id: crypto.randomUUID(),
        type: 'ContractData',
        data: {
          contractId: 'CCOUNTER123EXAMPLE456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          key: 'COUNTER',
          value: '0',
          durability: 'Persistent',
        },
      },
    ],
    sampleInvocations: [
      {
        functionName: 'increment',
        arguments: [],
      },
      {
        functionName: 'get_count',
        arguments: [],
      },
    ],
  },
  {
    id: 'token',
    name: 'Token Contract',
    description: 'Standard token with mint, transfer, and balance operations',
    wasmUrl: '/presets/token.wasm',
    sampleLedgerState: [
      {
        id: crypto.randomUUID(),
        type: 'Account',
        data: {
          accountId: 'GADMIN123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789',
          balance: '10000000000',
          sequence: '1',
        },
      },
      {
        id: crypto.randomUUID(),
        type: 'ContractData',
        data: {
          contractId: 'CTOKEN123EXAMPLE456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          key: 'ADMIN',
          value: '"GADMIN123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789"',
          durability: 'Persistent',
        },
      },
      {
        id: crypto.randomUUID(),
        type: 'ContractData',
        data: {
          contractId: 'CTOKEN123EXAMPLE456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          key: 'METADATA',
          value: '{"name": "SampleToken", "symbol": "SMPL", "decimals": 7}',
          durability: 'Persistent',
        },
      },
    ],
    sampleInvocations: [
      {
        functionName: 'initialize',
        arguments: [
          { name: 'admin', type: 'Address', value: 'GADMIN123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789' },
          { name: 'decimal', type: 'u32', value: '7' },
          { name: 'name', type: 'String', value: 'SampleToken' },
          { name: 'symbol', type: 'String', value: 'SMPL' },
        ],
      },
      {
        functionName: 'balance',
        arguments: [
          { name: 'id', type: 'Address', value: 'GADMIN123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789' },
        ],
      },
    ],
  },
  {
    id: 'voting',
    name: 'Voting Contract',
    description: 'On-chain voting with proposal creation and vote tracking',
    wasmUrl: '/presets/voting.wasm',
    sampleLedgerState: [
      {
        id: crypto.randomUUID(),
        type: 'Account',
        data: {
          accountId: 'GVOTER123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789',
          balance: '5000000000',
          sequence: '1',
        },
      },
      {
        id: crypto.randomUUID(),
        type: 'ContractData',
        data: {
          contractId: 'CVOTING123EXAMPLE456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          key: 'PROPOSAL_1',
          value: '{"title": "Increase Budget", "votes_for": 0, "votes_against": 0, "status": "active"}',
          durability: 'Persistent',
        },
      },
    ],
    sampleInvocations: [
      {
        functionName: 'initialize',
        arguments: [
          { name: 'admin', type: 'Address', value: 'GVOTER123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789' },
          { name: 'title', type: 'String', value: 'Budget Proposal' },
        ],
      },
      {
        functionName: 'vote',
        arguments: [
          { name: 'voter', type: 'Address', value: 'GVOTER123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789' },
          { name: 'option', type: 'u32', value: '1' },
        ],
      },
    ],
  },
  {
    id: 'nft',
    name: 'NFT Contract',
    description: 'Non-fungible token with mint, transfer, and metadata',
    wasmUrl: '/presets/nft.wasm',
    sampleLedgerState: [
      {
        id: crypto.randomUUID(),
        type: 'Account',
        data: {
          accountId: 'GNFTOWNER123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ12345',
          balance: '3000000000',
          sequence: '1',
        },
      },
      {
        id: crypto.randomUUID(),
        type: 'ContractData',
        data: {
          contractId: 'CNFT123EXAMPLE456789ABCDEFGHIJKLMNOPQRSTUVWXYZ1234',
          key: 'OWNER_1',
          value: '"GNFTOWNER123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ12345"',
          durability: 'Persistent',
        },
      },
      {
        id: crypto.randomUUID(),
        type: 'ContractData',
        data: {
          contractId: 'CNFT123EXAMPLE456789ABCDEFGHIJKLMNOPQRSTUVWXYZ1234',
          key: 'METADATA_1',
          value: '{"name": "Genesis NFT #1", "description": "First NFT", "image": "ipfs://QmExample..."}',
          durability: 'Persistent',
        },
      },
    ],
    sampleInvocations: [
      {
        functionName: 'mint',
        arguments: [
          { name: 'to', type: 'Address', value: 'GNFTOWNER123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ12345' },
          { name: 'token_id', type: 'u64', value: '1' },
          { name: 'metadata', type: 'String', value: '{"name": "My NFT"}' },
        ],
      },
      {
        functionName: 'owner_of',
        arguments: [
          { name: 'token_id', type: 'u64', value: '1' },
        ],
      },
    ],
  },
]

export default function ContractPresetLoader({ onLoadPreset }: ContractPresetLoaderProps) {
  const [showPresets, setShowPresets] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<ContractPreset | null>(null)

  const handleLoadPreset = (preset: ContractPreset) => {
    setSelectedPreset(preset)
    onLoadPreset(preset)
    setShowPresets(false)
  }

  return (
    <div className="space-y-2">
      {/* Preset Button */}
      <button
        onClick={() => setShowPresets(!showPresets)}
        className="w-full btn-secondary text-sm"
      >
        📦 {showPresets ? 'Hide' : 'Load'} Contract Presets
      </button>

      {/* Presets Grid */}
      {showPresets && (
        <div className="grid grid-cols-1 gap-2 p-3 bg-gray-50 rounded border border-gray-200">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset)}
              className={`text-left p-3 rounded border-2 transition-all hover:border-stellar-purple hover:shadow-md ${
                selectedPreset?.id === preset.id
                  ? 'border-stellar-purple bg-purple-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="font-semibold text-sm text-gray-900">
                {preset.name}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {preset.description}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>📝 {preset.sampleInvocations.length} examples</span>
                <span>•</span>
                <span>💾 {preset.sampleLedgerState.length} ledger entries</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Selected Preset Info */}
      {selectedPreset && !showPresets && (
        <div className="bg-purple-50 border border-purple-200 rounded p-2 text-xs text-purple-800">
          ✓ Loaded preset: <strong>{selectedPreset.name}</strong>
        </div>
      )}

      {/* Note */}
      {showPresets && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
          💡 <strong>Note:</strong> Presets include sample WASM, ledger state, and example invocations. 
          You'll need to upload the actual WASM file separately.
        </div>
      )}
    </div>
  )
}
