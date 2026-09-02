import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LedgerEntryEditor from './LedgerEntryEditor'
import type { LedgerEntry } from '../types'

describe('LedgerEntryEditor', () => {
  it('renders empty state when no entries provided', () => {
    const onEntriesChange = vi.fn()
    render(<LedgerEntryEditor entries={[]} onEntriesChange={onEntriesChange} />)
    
    expect(screen.getByText(/no ledger entries/i)).toBeInTheDocument()
  })

  it('displays add entry button', () => {
    const onEntriesChange = vi.fn()
    render(<LedgerEntryEditor entries={[]} onEntriesChange={onEntriesChange} />)
    
    expect(screen.getByRole('button', { name: /add entry/i })).toBeInTheDocument()
  })

  it('renders list of ledger entries', () => {
    const entries: LedgerEntry[] = [
      {
        id: '1',
        type: 'Account',
        data: { address: 'GABBBB', balance: '1000000' },
      },
      {
        id: '2',
        type: 'ContractData',
        data: { contractId: 'CABBBB', key: 'counter', value: '42' },
      },
    ]
    const onEntriesChange = vi.fn()
    render(<LedgerEntryEditor entries={entries} onEntriesChange={onEntriesChange} />)
    
    expect(screen.getByText(/Account/i)).toBeInTheDocument()
    expect(screen.getByText(/ContractData/i)).toBeInTheDocument()
  })

  it('shows edit and delete buttons for each entry', () => {
    const entries: LedgerEntry[] = [
      {
        id: '1',
        type: 'Account',
        data: { address: 'GABBBB', balance: '1000000' },
      },
    ]
    const onEntriesChange = vi.fn()
    render(<LedgerEntryEditor entries={entries} onEntriesChange={onEntriesChange} />)
    
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('calls onEntriesChange when delete button is clicked', async () => {
    const user = userEvent.setup()
    const entries: LedgerEntry[] = [
      {
        id: '1',
        type: 'Account',
        data: { address: 'GABBBB', balance: '1000000' },
      },
    ]
    const onEntriesChange = vi.fn()
    
    // Mock window.confirm to return true
    vi.stubGlobal('confirm', vi.fn(() => true))
    
    render(<LedgerEntryEditor entries={entries} onEntriesChange={onEntriesChange} />)
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)
    
    expect(window.confirm).toHaveBeenCalled()
    expect(onEntriesChange).toHaveBeenCalledWith([])
    
    vi.unstubAllGlobals()
  })

  it('displays entry count', () => {
    const entries: LedgerEntry[] = [
      { id: '1', type: 'Account', data: {} },
      { id: '2', type: 'ContractData', data: {} },
      { id: '3', type: 'ContractCode', data: {} },
    ]
    const onEntriesChange = vi.fn()
    render(<LedgerEntryEditor entries={entries} onEntriesChange={onEntriesChange} />)
    
    // Use getByText with a specific pattern that only matches the header
    expect(screen.getByText(/Ledger Entries \(3\)/i)).toBeInTheDocument()
  })
})
