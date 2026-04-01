import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import CountdownTimer from './CountdownTimer'

describe('CountdownTimer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('displays formatted time on render', () => {
    render(<CountdownTimer seconds={90} />)
    expect(screen.getByText('01:30')).toBeInTheDocument()
  })

  it('starts counting down when clicked', () => {
    render(<CountdownTimer seconds={90} />)
    fireEvent.click(screen.getByRole('button'))
    act(() => vi.advanceTimersByTime(3000))
    expect(screen.getByText('01:27')).toBeInTheDocument()
  })

  it('pauses when clicked again while running', () => {
    render(<CountdownTimer seconds={90} />)
    fireEvent.click(screen.getByRole('button'))
    act(() => vi.advanceTimersByTime(3000))
    fireEvent.click(screen.getByRole('button'))
    act(() => vi.advanceTimersByTime(3000))
    expect(screen.getByText('01:27')).toBeInTheDocument()
  })

  it('stops at 00:00', () => {
    render(<CountdownTimer seconds={3} />)
    fireEvent.click(screen.getByRole('button'))
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })
})
