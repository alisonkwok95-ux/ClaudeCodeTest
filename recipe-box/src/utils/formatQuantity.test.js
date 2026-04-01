import { describe, it, expect } from 'vitest'
import { formatQuantity } from './formatQuantity'

describe('formatQuantity', () => {
  it('returns whole number as string', () => {
    expect(formatQuantity(2)).toBe('2')
  })
  it('returns 0.5 as ½', () => {
    expect(formatQuantity(0.5)).toBe('½')
  })
  it('returns 0.25 as ¼', () => {
    expect(formatQuantity(0.25)).toBe('¼')
  })
  it('returns 0.75 as ¾', () => {
    expect(formatQuantity(0.75)).toBe('¾')
  })
  it('returns 0.33 as ⅓', () => {
    expect(formatQuantity(0.33)).toBe('⅓')
  })
  it('returns 0.67 as ⅔', () => {
    expect(formatQuantity(0.67)).toBe('⅔')
  })
  it('returns 1.5 as 1 ½', () => {
    expect(formatQuantity(1.5)).toBe('1 ½')
  })
  it('returns 2.25 as 2 ¼', () => {
    expect(formatQuantity(2.25)).toBe('2 ¼')
  })
  it('returns decimal with no clean fraction as trimmed string', () => {
    expect(formatQuantity(1.2)).toBe('1.2')
  })
  it('returns null as empty string', () => {
    expect(formatQuantity(null)).toBe('')
  })
})
