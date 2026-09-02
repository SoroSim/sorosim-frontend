import { useState } from 'react'
import type { AccountEntry, ContractDataEntry, ContractCodeEntry } from '../types'

interface TypeFormProps {
  initialData?: unknown
  onDataChange: (data: unknown) => void
}

export function AccountEntryForm({ initialData, onDataChange }: TypeFormProps) {
  const data = (initialData as AccountEntry) || {
    accountId: '',
    balance: '0',
    sequence: '0',
  }

  const [formData, setFormData] = useState<AccountEntry>(data)

  const handleChange = (field: keyof AccountEntry, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onDataChange(updated)
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="account-id" className="label">
          Account ID <span className="text-red-500">*</span>
        </label>
        <input
          id="account-id"
          type="text"
          value={formData.accountId}
          onChange={(e) => handleChange('accountId', e.target.value)}
          placeholder="GABC... (Stellar public key)"
          className="input-field font-mono text-sm"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          56-character Stellar public key starting with 'G'
        </p>
      </div>

      <div>
        <label htmlFor="account-balance" className="label">
          Balance (stroops) <span className="text-red-500">*</span>
        </label>
        <input
          id="account-balance"
          type="text"
          value={formData.balance}
          onChange={(e) => handleChange('balance', e.target.value)}
          placeholder="10000000 (1 XLM = 10,000,000 stroops)"
          className="input-field font-mono"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Account balance in stroops (1 XLM = 10,000,000 stroops)
        </p>
      </div>

      <div>
        <label htmlFor="account-sequence" className="label">
          Sequence Number <span className="text-red-500">*</span>
        </label>
        <input
          id="account-sequence"
          type="text"
          value={formData.sequence}
          onChange={(e) => handleChange('sequence', e.target.value)}
          placeholder="123456789"
          className="input-field font-mono"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Account sequence number for transaction ordering
        </p>
      </div>
    </div>
  )
}

export function ContractDataEntryForm({ initialData, onDataChange }: TypeFormProps) {
  const data = (initialData as ContractDataEntry) || {
    contractId: '',
    key: '',
    value: '',
    durability: 'Persistent' as const,
  }

  const [formData, setFormData] = useState<ContractDataEntry>(data)

  const handleChange = (field: keyof ContractDataEntry, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onDataChange(updated)
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="contract-id" className="label">
          Contract ID <span className="text-red-500">*</span>
        </label>
        <input
          id="contract-id"
          type="text"
          value={formData.contractId}
          onChange={(e) => handleChange('contractId', e.target.value)}
          placeholder="CABC... (Contract address)"
          className="input-field font-mono text-sm"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Contract address starting with 'C'
        </p>
      </div>

      <div>
        <label htmlFor="data-key" className="label">
          Storage Key <span className="text-red-500">*</span>
        </label>
        <input
          id="data-key"
          type="text"
          value={formData.key}
          onChange={(e) => handleChange('key', e.target.value)}
          placeholder="counter, balance, etc."
          className="input-field font-mono"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          The key identifying this storage entry
        </p>
      </div>

      <div>
        <label htmlFor="data-value" className="label">
          Storage Value <span className="text-red-500">*</span>
        </label>
        <textarea
          id="data-value"
          value={formData.value}
          onChange={(e) => handleChange('value', e.target.value)}
          placeholder='{"count": 42} or "100" or [1,2,3]'
          rows={4}
          className="input-field font-mono text-sm"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Value stored at this key (JSON format or string)
        </p>
      </div>

      <div>
        <label htmlFor="data-durability" className="label">
          Durability <span className="text-red-500">*</span>
        </label>
        <select
          id="data-durability"
          value={formData.durability}
          onChange={(e) => handleChange('durability', e.target.value)}
          className="input-field"
          required
        >
          <option value="Persistent">Persistent</option>
          <option value="Temporary">Temporary</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Persistent: Long-term storage | Temporary: Short-lived data
        </p>
      </div>
    </div>
  )
}

export function ContractCodeEntryForm({ initialData, onDataChange }: TypeFormProps) {
  const data = (initialData as ContractCodeEntry) || {
    hash: '',
    wasmBytes: new Uint8Array(),
  }

  const [formData, setFormData] = useState<ContractCodeEntry>(data)
  const [wasmFile, setWasmFile] = useState<File | null>(null)

  const handleHashChange = (value: string) => {
    const updated = { ...formData, hash: value }
    setFormData(updated)
    onDataChange(updated)
  }

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setWasmFile(null)
      return
    }

    setWasmFile(file)
    
    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      const updated = { ...formData, wasmBytes: bytes }
      setFormData(updated)
      onDataChange(updated)
    } catch (err) {
      console.error('Failed to read WASM file:', err)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="code-hash" className="label">
          WASM Hash <span className="text-red-500">*</span>
        </label>
        <input
          id="code-hash"
          type="text"
          value={formData.hash}
          onChange={(e) => handleHashChange(e.target.value)}
          placeholder="0x... (SHA-256 hash of WASM)"
          className="input-field font-mono text-sm"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          SHA-256 hash of the contract WASM code
        </p>
      </div>

      <div>
        <label htmlFor="code-wasm" className="label">
          WASM File <span className="text-red-500">*</span>
        </label>
        <input
          id="code-wasm"
          type="file"
          accept=".wasm"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="input-field text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload the contract WASM binary file
        </p>
        
        {wasmFile && (
          <div className="mt-2 bg-green-50 border border-green-200 rounded p-2 text-xs text-green-800">
            ✓ Loaded: {wasmFile.name} ({(wasmFile.size / 1024).toFixed(2)} KB)
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
        💡 Contract code entries store the WASM bytecode on-chain
      </div>
    </div>
  )
}

export function TrustlineEntryForm({ initialData, onDataChange }: TypeFormProps) {
  const data = (initialData as any) || {
    accountId: '',
    asset: '',
    limit: '0',
    balance: '0',
  }

  const [formData, setFormData] = useState(data)

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onDataChange(updated)
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="trustline-account" className="label">
          Account ID <span className="text-red-500">*</span>
        </label>
        <input
          id="trustline-account"
          type="text"
          value={formData.accountId}
          onChange={(e) => handleChange('accountId', e.target.value)}
          placeholder="GABC... (Account address)"
          className="input-field font-mono text-sm"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Account that holds the trustline
        </p>
      </div>

      <div>
        <label htmlFor="trustline-asset" className="label">
          Asset Code <span className="text-red-500">*</span>
        </label>
        <input
          id="trustline-asset"
          type="text"
          value={formData.asset}
          onChange={(e) => handleChange('asset', e.target.value)}
          placeholder="USDC, BTC, custom_asset, etc."
          className="input-field"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Asset code for this trustline
        </p>
      </div>

      <div>
        <label htmlFor="trustline-limit" className="label">
          Trust Limit <span className="text-red-500">*</span>
        </label>
        <input
          id="trustline-limit"
          type="text"
          value={formData.limit}
          onChange={(e) => handleChange('limit', e.target.value)}
          placeholder="1000000"
          className="input-field font-mono"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Maximum amount of this asset the account trusts
        </p>
      </div>

      <div>
        <label htmlFor="trustline-balance" className="label">
          Current Balance <span className="text-red-500">*</span>
        </label>
        <input
          id="trustline-balance"
          type="text"
          value={formData.balance}
          onChange={(e) => handleChange('balance', e.target.value)}
          placeholder="500000"
          className="input-field font-mono"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Current balance of this asset held by the account
        </p>
      </div>
    </div>
  )
}
