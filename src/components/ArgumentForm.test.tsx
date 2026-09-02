import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ArgumentForm from './ArgumentForm'
import type { ContractFunction } from '../types'

describe('ArgumentForm', () => {
  const mockFunction: ContractFunction = {
    name: 'transfer',
    inputs: [
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'Address' },
      { name: 'amount', type: 'i128' },
    ],
    outputs: ['void'],
  }

  it('renders empty state when no function is selected', () => {
    const onArgumentsChange = vi.fn()
    render(<ArgumentForm selectedFunction={null} onArgumentsChange={onArgumentsChange} />)
    
    // When no function is selected, it shows "This function takes no arguments"
    expect(screen.getByText(/this function takes no arguments/i)).toBeInTheDocument()
  })

  it('renders input fields for each function parameter', () => {
    const onArgumentsChange = vi.fn()
    render(<ArgumentForm selectedFunction={mockFunction} onArgumentsChange={onArgumentsChange} />)
    
    expect(screen.getByLabelText(/from/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/to/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
  })

  it('displays parameter names', () => {
    const onArgumentsChange = vi.fn()
    render(<ArgumentForm selectedFunction={mockFunction} onArgumentsChange={onArgumentsChange} />)
    
    // Check parameter names are shown
    expect(screen.getByText('from')).toBeInTheDocument()
    expect(screen.getByText('to')).toBeInTheDocument()
    expect(screen.getByText('amount')).toBeInTheDocument()
  })

  it('calls onArgumentsChange when user types in input fields', async () => {
    const user = userEvent.setup()
    const onArgumentsChange = vi.fn()
    render(<ArgumentForm selectedFunction={mockFunction} onArgumentsChange={onArgumentsChange} />)
    
    const fromInput = screen.getByLabelText(/from/i)
    await user.type(fromInput, 'GABBBBBBBBBB')
    
    expect(onArgumentsChange).toHaveBeenCalled()
  })

  it('shows type information for each parameter', () => {
    const onArgumentsChange = vi.fn()
    render(<ArgumentForm selectedFunction={mockFunction} onArgumentsChange={onArgumentsChange} />)
    
    // Use getAllByText since Address appears twice
    const addressTypes = screen.getAllByText('Address')
    expect(addressTypes.length).toBe(2)
    expect(screen.getByText('i128')).toBeInTheDocument()
  })
})
