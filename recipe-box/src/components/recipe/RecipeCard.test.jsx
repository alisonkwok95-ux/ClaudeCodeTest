import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import RecipeCard from './RecipeCard'

// Mock supabase to avoid env var issues in tests
vi.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/img.jpg' } }),
      }),
    },
  },
}))

const recipe = {
  id: 'abc-123',
  title: 'Pasta al Limone',
  cuisine_tag: 'Italian',
  is_favourite: false,
  recipe_images: [],
}

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <RecipeCard recipe={recipe} onToggleFavourite={vi.fn()} {...props} />
    </MemoryRouter>
  )
}

describe('RecipeCard', () => {
  it('renders title and cuisine tag', () => {
    renderCard()
    expect(screen.getByText('Pasta al Limone')).toBeInTheDocument()
    expect(screen.getByText('Italian')).toBeInTheDocument()
  })

  it('calls onToggleFavourite with toggled value when star clicked', () => {
    const onToggle = vi.fn()
    renderCard({ onToggleFavourite: onToggle })
    fireEvent.click(screen.getByRole('button', { name: /favourite/i }))
    expect(onToggle).toHaveBeenCalledWith({ id: 'abc-123', is_favourite: true })
  })

  it('shows filled star when is_favourite is true', () => {
    renderCard({ recipe: { ...recipe, is_favourite: true } })
    expect(screen.getByRole('button', { name: /favourite/i })).toHaveAttribute('data-starred', 'true')
  })

  it('shows empty image placeholder when no recipe_images', () => {
    renderCard()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('shows thumbnail when recipe has source image', () => {
    renderCard({
      recipe: {
        ...recipe,
        recipe_images: [{ image_type: 'source', storage_path: 'source/abc/img.jpg' }],
      },
    })
    expect(screen.getByRole('img')).toBeInTheDocument()
  })
})
