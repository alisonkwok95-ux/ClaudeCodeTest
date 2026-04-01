import { describe, it, expect } from 'vitest'
import { scaleIngredients } from './scaleIngredients'

const base = [
  { quantity: 400, unit: 'g', name: 'pasta', notes: '' },
  { quantity: 2, unit: 'tbsp', name: 'olive oil', notes: '' },
  { quantity: null, unit: 'pinch', name: 'salt', notes: '' },
]

describe('scaleIngredients', () => {
  it('returns same quantities when serving count unchanged', () => {
    const result = scaleIngredients(base, 4, 4)
    expect(result[0].quantity).toBe(400)
  })

  it('halves quantities when servings halved', () => {
    const result = scaleIngredients(base, 4, 2)
    expect(result[0].quantity).toBe(200)
    expect(result[1].quantity).toBe(1)
  })

  it('doubles quantities when servings doubled', () => {
    const result = scaleIngredients(base, 4, 8)
    expect(result[0].quantity).toBe(800)
  })

  it('leaves null quantity as null', () => {
    const result = scaleIngredients(base, 4, 8)
    expect(result[2].quantity).toBeNull()
  })

  it('preserves non-quantity fields', () => {
    const result = scaleIngredients(base, 4, 2)
    expect(result[0].unit).toBe('g')
    expect(result[0].name).toBe('pasta')
  })

  it('rounds to 2 decimal places', () => {
    const result = scaleIngredients([{ quantity: 1, unit: 'cup', name: 'flour', notes: '' }], 3, 2)
    expect(result[0].quantity).toBe(0.67)
  })
})
