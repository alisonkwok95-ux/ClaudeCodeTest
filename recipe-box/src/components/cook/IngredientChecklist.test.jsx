import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import IngredientChecklist from './IngredientChecklist'

const ingredients = [
  { quantity: 400, unit: 'g', name: 'pasta', notes: '' },
  { quantity: 2, unit: 'tbsp', name: 'olive oil', notes: '' },
]

describe('IngredientChecklist', () => {
  it('renders all ingredients', () => {
    render(<IngredientChecklist ingredients={ingredients} checked={new Set()} onToggle={vi.fn()} />)
    expect(screen.getByText(/pasta/)).toBeInTheDocument()
    expect(screen.getByText(/olive oil/)).toBeInTheDocument()
  })

  it('calls onToggle with index when item clicked', () => {
    const onToggle = vi.fn()
    render(<IngredientChecklist ingredients={ingredients} checked={new Set()} onToggle={onToggle} />)
    fireEvent.click(screen.getByText(/pasta/).closest('li'))
    expect(onToggle).toHaveBeenCalledWith(0)
  })

  it('applies strikethrough style for checked items', () => {
    render(<IngredientChecklist ingredients={ingredients} checked={new Set([0])} onToggle={vi.fn()} />)
    const item = screen.getByText(/pasta/).closest('li')
    expect(item).toHaveClass('line-through')
  })
})
