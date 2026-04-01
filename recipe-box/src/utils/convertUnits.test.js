import { describe, it, expect } from 'vitest'
import { convert } from './convertUnits'

describe('convert', () => {
  it('converts ml to fl oz', () => {
    expect(convert(100, 'ml', 'floz')).toBeCloseTo(3.38, 1)
  })

  it('converts fl oz to ml', () => {
    expect(convert(1, 'floz', 'ml')).toBeCloseTo(29.57, 1)
  })

  it('converts Celsius to Fahrenheit', () => {
    expect(convert(100, 'C', 'F')).toBe(212)
  })

  it('converts Fahrenheit to Celsius', () => {
    expect(convert(32, 'F', 'C')).toBe(0)
  })

  it('converts tbsp to ml', () => {
    expect(convert(1, 'tbsp', 'ml')).toBeCloseTo(14.79, 1)
  })

  it('converts ml to tbsp', () => {
    expect(convert(14.79, 'ml', 'tbsp')).toBeCloseTo(1, 1)
  })

  it('converts g to cups using flour density', () => {
    expect(convert(125, 'g', 'cups', 'flour')).toBeCloseTo(1, 1)
  })

  it('converts cups to g using water density', () => {
    expect(convert(1, 'cups', 'g', 'water')).toBeCloseTo(237, 0)
  })

  it('returns null for unsupported conversion', () => {
    expect(convert(1, 'kg', 'miles')).toBeNull()
  })
})
