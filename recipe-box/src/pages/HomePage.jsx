import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecipeList, useToggleFavourite } from '../hooks/useRecipes'
import RecipeCard from '../components/recipe/RecipeCard'
import Spinner from '../components/ui/Spinner'

export default function HomePage() {
  const { data: recipes, isLoading, error } = useRecipeList()
  const toggleFavourite = useToggleFavourite()
  const [search, setSearch] = useState('')
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false)

  const filtered = (recipes ?? [])
    .filter(r => !showFavouritesOnly || r.is_favourite)
    .filter(r =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.cuisine_tag ?? '').toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-4xl text-stone-800">My Recipe Box</h1>
        </div>

        <div className="flex gap-3 mb-8">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search recipes…"
            className="flex-1 border border-stone-300 rounded-lg px-4 py-2.5 text-sm font-sans bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          />
          <button
            type="button"
            onClick={() => setShowFavouritesOnly(v => !v)}
            className={`px-4 py-2.5 rounded-lg text-sm font-sans font-medium border transition-colors ${
              showFavouritesOnly
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-white text-stone-600 border-stone-300 hover:border-terracotta/60'
            }`}
          >
            ★ Favourites
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20"><Spinner /></div>
        )}

        {error && (
          <p className="text-red-600 font-sans text-sm">{error.message}</p>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-stone-400 font-sans py-20">
            {recipes?.length === 0 ? 'No recipes yet. Add your first one!' : 'No recipes match your search.'}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onToggleFavourite={toggleFavourite.mutate}
            />
          ))}
        </div>
      </div>

      {/* FAB */}
      <Link
        to="/extract"
        className="fixed bottom-6 right-6 bg-terracotta text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-terracotta-dark transition-colors"
        aria-label="Add recipe"
      >
        +
      </Link>
    </div>
  )
}
