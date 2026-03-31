import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ServingScaler from './ServingScaler'

describe('ServingScaler', () => {
  it('renders current servings', () => {
    render(<ServingScaler value={4} onChange={vi.fn()} />)
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('calls onChange with incremented value when + clicked', () => {
    const onChange = vi.fn()
    render(<ServingScaler value={4} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('calls onChange with decremented value when − clicked', () => {
    const onChange = vi.fn()
    render(<ServingScaler value={4} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '−' }))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('does not go below 1', () => {
    const onChange = vi.fn()
    render(<ServingScaler value={1} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '−' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
