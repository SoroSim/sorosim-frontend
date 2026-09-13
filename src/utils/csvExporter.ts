import type { LedgerEntry, AccountEntry, ContractDataEntry } from '../types'

/**
 * Convert ledger entries to CSV format
 */
export function ledgerEntriesToCSV(entries: LedgerEntry[]): string {
  if (entries.length === 0) {
    return 'No entries to export'
  }

  // Define CSV headers
  const headers = [
    'Entry ID',
    'Entry Type',
    'Account ID',
    'Balance',
    'Sequence',
    'Contract ID',
    'Key',
    'Value',
    'Durability',
    'Hash',
  ]

  // Create CSV rows
  const rows: string[][] = [headers]

  for (const entry of entries) {
    const row = flattenLedgerEntry(entry)
    rows.push(row)
  }

  // Convert to CSV string
  return rows.map(row => row.map(cell => escapeCSVCell(cell)).join(',')).join('\n')
}

/**
 * Flatten a ledger entry into a CSV row
 */
function flattenLedgerEntry(entry: LedgerEntry): string[] {
  const row = [
    entry.id,
    entry.type,
    '', // Account ID
    '', // Balance
    '', // Sequence
    '', // Contract ID
    '', // Key
    '', // Value
    '', // Durability
    '', // Hash
  ]

  // Fill in type-specific fields
  switch (entry.type) {
    case 'Account': {
      const data = entry.data as AccountEntry
      row[2] = data.accountId || ''
      row[3] = data.balance || ''
      row[4] = data.sequence || ''
      break
    }

    case 'ContractData': {
      const data = entry.data as ContractDataEntry
      row[5] = data.contractId || ''
      row[6] = data.key || ''
      row[7] = data.value || ''
      row[8] = data.durability || ''
      break
    }

    case 'ContractCode': {
      const data = entry.data as { hash?: string }
      row[9] = data.hash || ''
      break
    }

    case 'Trustline': {
      // Trustline data structure varies, serialize as JSON
      row[7] = JSON.stringify(entry.data)
      break
    }

    default:
      // Unknown type, serialize data as JSON
      row[7] = JSON.stringify(entry.data)
  }

  return row
}

/**
 * Escape special characters in CSV cells
 */
function escapeCSVCell(cell: string): string {
  // Convert to string if not already
  const str = String(cell)

  // If cell contains comma, newline, or quote, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Download CSV data as a file
 */
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Generate a timestamped filename for CSV export
 */
export function generateCSVFilename(prefix: string = 'ledger-state'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `${prefix}-${timestamp}.csv`
}
