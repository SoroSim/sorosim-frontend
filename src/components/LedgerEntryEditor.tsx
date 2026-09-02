import { useState } from 'react'
import type { LedgerEntry, LedgerEntryType } from '../types'
import {
  AccountEntryForm,
  ContractDataEntryForm,
  ContractCodeEntryForm,
  TrustlineEntryForm,
} from './LedgerEntryTypeForms'

interface LedgerEntryEditorProps {
  entries: LedgerEntry[]
  onEntriesChange: (entries: LedgerEntry[]) => void
}

export default function LedgerEntryEditor({
  entries,
  onEntriesChange,
}: LedgerEntryEditorProps) {
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)

  const handleAddEntry = () => {
    setIsAddingEntry(true)
    setEditingEntryId(null)
  }

  const handleSaveNewEntry = (entry: Omit<LedgerEntry, 'id'>) => {
    const newEntry: LedgerEntry = {
      ...entry,
      id: crypto.randomUUID(),
    }
    onEntriesChange([...entries, newEntry])
    setIsAddingEntry(false)
  }

  const handleEditEntry = (id: string) => {
    setEditingEntryId(id)
    setIsAddingEntry(false)
  }

  const handleUpdateEntry = (id: string, updatedEntry: Omit<LedgerEntry, 'id'>) => {
    const newEntries = entries.map(entry =>
      entry.id === id ? { ...updatedEntry, id } : entry
    )
    onEntriesChange(newEntries)
    setEditingEntryId(null)
  }

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this ledger entry?')) {
      onEntriesChange(entries.filter(entry => entry.id !== id))
    }
  }

  const handleCancel = () => {
    setIsAddingEntry(false)
    setEditingEntryId(null)
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Ledger Entries ({entries.length})
        </h3>
        {!isAddingEntry && !editingEntryId && (
          <button
            onClick={handleAddEntry}
            className="text-sm text-stellar-purple hover:underline font-medium"
          >
            + Add Entry
          </button>
        )}
      </div>

      {/* Entry Form (Add or Edit) */}
      {(isAddingEntry || editingEntryId) && (
        <LedgerEntryForm
          entry={editingEntryId ? entries.find(e => e.id === editingEntryId) : undefined}
          onSave={(entry) => {
            if (editingEntryId) {
              handleUpdateEntry(editingEntryId, entry)
            } else {
              handleSaveNewEntry(entry)
            }
          }}
          onCancel={handleCancel}
        />
      )}

      {/* Entries List */}
      {entries.length === 0 && !isAddingEntry ? (
        <div className="bg-gray-50 rounded p-4 text-sm text-gray-500 text-center">
          No ledger entries configured yet. Click "Add Entry" to create one.
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <LedgerEntryCard
              key={entry.id}
              entry={entry}
              isEditing={editingEntryId === entry.id}
              onEdit={() => handleEditEntry(entry.id)}
              onDelete={() => handleDeleteEntry(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface LedgerEntryFormProps {
  entry?: LedgerEntry
  onSave: (entry: Omit<LedgerEntry, 'id'>) => void
  onCancel: () => void
}

function LedgerEntryForm({ entry, onSave, onCancel }: LedgerEntryFormProps) {
  const [type, setType] = useState<LedgerEntryType>(entry?.type || 'Account')
  const [data, setData] = useState<unknown>(entry?.data || {})
  const [useRawJson, setUseRawJson] = useState(false)
  const [rawData, setRawData] = useState<string>(
    entry ? JSON.stringify(entry.data, null, 2) : '{}'
  )
  const [error, setError] = useState<string | null>(null)

  const handleTypeChange = (newType: LedgerEntryType) => {
    setType(newType)
    // Reset data when type changes
    setData({})
    setRawData('{}')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      let finalData = data

      if (useRawJson) {
        finalData = JSON.parse(rawData)
      }

      // Basic validation
      if (!finalData || (typeof finalData === 'object' && Object.keys(finalData).length === 0)) {
        setError('Please provide entry data')
        return
      }

      onSave({ type, data: finalData })
    } catch (err) {
      setError('Invalid JSON format. Please check your input.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded p-4 space-y-3">
      <div>
        <label htmlFor="entry-type" className="label">
          Entry Type
        </label>
        <select
          id="entry-type"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as LedgerEntryType)}
          className="input-field"
        >
          <option value="Account">Account</option>
          <option value="ContractData">Contract Data</option>
          <option value="ContractCode">Contract Code</option>
          <option value="Trustline">Trustline</option>
        </select>
      </div>

      {/* Toggle between structured form and raw JSON */}
      <div className="flex items-center gap-2">
        <input
          id="use-raw-json"
          type="checkbox"
          checked={useRawJson}
          onChange={(e) => setUseRawJson(e.target.checked)}
          className="h-4 w-4 text-stellar-purple focus:ring-stellar-purple border-gray-300 rounded"
        />
        <label htmlFor="use-raw-json" className="text-xs text-gray-700">
          Use raw JSON editor
        </label>
      </div>

      {/* Structured Form or Raw JSON */}
      {useRawJson ? (
        <div>
          <label htmlFor="entry-data" className="label">
            Entry Data (JSON)
          </label>
          <textarea
            id="entry-data"
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            rows={10}
            className="input-field font-mono text-xs"
            placeholder='{"key": "value"}'
          />
          <p className="text-xs text-gray-600 mt-1">
            Enter the ledger entry data in JSON format
          </p>
        </div>
      ) : (
        <div>
          {type === 'Account' && (
            <AccountEntryForm initialData={data} onDataChange={setData} />
          )}
          {type === 'ContractData' && (
            <ContractDataEntryForm initialData={data} onDataChange={setData} />
          )}
          {type === 'ContractCode' && (
            <ContractCodeEntryForm initialData={data} onDataChange={setData} />
          )}
          {type === 'Trustline' && (
            <TrustlineEntryForm initialData={data} onDataChange={setData} />
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button type="submit" className="btn-primary text-sm py-2">
          {entry ? 'Update Entry' : 'Add Entry'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm py-2">
          Cancel
        </button>
      </div>
    </form>
  )
}

interface LedgerEntryCardProps {
  entry: LedgerEntry
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
}

function LedgerEntryCard({ entry, isEditing, onEdit, onDelete }: LedgerEntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isEditing) return null

  return (
    <div className="bg-white border border-gray-200 rounded p-3 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-block px-2 py-1 bg-stellar-purple text-white text-xs font-semibold rounded">
              {entry.type}
            </span>
            <span className="text-xs text-gray-500">ID: {entry.id.slice(0, 8)}...</span>
          </div>
          
          {/* Data Preview */}
          <div className="mt-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-stellar-purple hover:underline"
            >
              {isExpanded ? '▼ Hide Data' : '▶ Show Data'}
            </button>
            
            {isExpanded && (
              <pre className="mt-2 bg-gray-50 rounded p-2 text-xs font-mono overflow-x-auto">
                {JSON.stringify(entry.data, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 ml-3">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
            title="Edit entry"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 text-xs font-medium"
            title="Delete entry"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
