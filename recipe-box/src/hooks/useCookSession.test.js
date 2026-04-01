import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCookSession } from './useCookSession'

const steps = [
  { order: 1, text: 'Boil water', duration_seconds: null },
  { order: 2, text: 'Cook pasta', duration_seconds: 600 },
  { order: 3, text: 'Drain pasta', duration_seconds: null },
]

describe('useCookSession', () => {
  it('starts on step 0', () => {
    const { result } = renderHook(() => useCookSession(steps))
    expect(result.current.currentIndex).toBe(0)
  })

  it('advances to next step', () => {
    const { result } = renderHook(() => useCookSession(steps))
    act(() => result.current.nextStep())
    expect(result.current.currentIndex).toBe(1)
  })

  it('does not advance past last step', () => {
    const { result } = renderHook(() => useCookSession(steps))
    act(() => result.current.nextStep())
    act(() => result.current.nextStep())
    act(() => result.current.nextStep())
    expect(result.current.currentIndex).toBe(2)
  })

  it('goes back to previous step', () => {
    const { result } = renderHook(() => useCookSession(steps))
    act(() => result.current.nextStep())
    act(() => result.current.prevStep())
    expect(result.current.currentIndex).toBe(0)
  })

  it('does not go before step 0', () => {
    const { result } = renderHook(() => useCookSession(steps))
    act(() => result.current.prevStep())
    expect(result.current.currentIndex).toBe(0)
  })

  it('toggles ingredient check state', () => {
    const { result } = renderHook(() => useCookSession(steps))
    act(() => result.current.toggleIngredient(0))
    expect(result.current.checkedIngredients.has(0)).toBe(true)
    act(() => result.current.toggleIngredient(0))
    expect(result.current.checkedIngredients.has(0)).toBe(false)
  })
})
