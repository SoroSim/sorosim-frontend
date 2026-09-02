import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StateDiffViewer from './StateDiffViewer'
import type { StateDiff } from '../types'

describe('StateDiffViewer', () => {
  it('renders empty state when no diffs provided', () => {
    render(<StateDiffViewer diffs={[]} />)
    expect(screen.getByText(/no state changes detected/i)).toBeInTheDocument()
  })

  it('renders added entries with green styling', () => {
    const diffs: StateDiff[] = [
      {
        type: 'added',
        key: 'Balance:GABBBB',
        oldValue: undefined,
        newValue: '1000000',
      },
    ]
    render(<StateDiffViewer diffs={diffs} />)
    
    expect(screen.getByText(/Balance:GABBBB/i)).toBeInTheDocument()
    expect(screen.getByText(/added/i)).toBeInTheDocument()
  })

  it('renders modified entries with yellow styling', () => {
    const diffs: StateDiff[] = [
      {
        type: 'modified',
        key: 'Balance:GCCCCC',
        oldValue: '500000',
        newValue: '750000',
      },
    ]
    render(<StateDiffViewer diffs={diffs} />)
    
    expect(screen.getByText(/Balance:GCCCCC/i)).toBeInTheDocument()
    expect(screen.getByText(/modified/i)).toBeInTheDocument()
  })

  it('renders removed entries with red styling', () => {
    const diffs: StateDiff[] = [
      {
        type: 'removed',
        key: 'TempData:xyz',
        oldValue: 'temporary',
        newValue: undefined,
      },
    ]
    render(<StateDiffViewer diffs={diffs} />)
    
    expect(screen.getByText(/TempData:xyz/i)).toBeInTheDocument()
    expect(screen.getByText(/removed/i)).toBeInTheDocument()
  })

  it('displays total change count', () => {
    const diffs: StateDiff[] = [
      { type: 'added', key: 'key1', oldValue: undefined, newValue: 'value1' },
      { type: 'modified', key: 'key2', oldValue: 'old', newValue: 'new' },
      { type: 'removed', key: 'key3', oldValue: 'value3', newValue: undefined },
    ]
    render(<StateDiffViewer diffs={diffs} />)
    
    // The count is shown in the "All" button
    expect(screen.getByText(/All \(3\)/i)).toBeInTheDocument()
  })

  it('shows filter buttons with color indicators', () => {
    const diffs: StateDiff[] = [
      { type: 'added', key: 'key1', oldValue: undefined, newValue: 'value1' },
    ]
    render(<StateDiffViewer diffs={diffs} />)
    
    expect(screen.getByText(/added/i)).toBeInTheDocument()
    expect(screen.getByText(/All \(1\)/i)).toBeInTheDocument()
  })
})
