import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function getThumbnailUrl(recipe) {
  const myVersion = recipe.recipe_images?.find(img => img.image_type === 'my_version')
  const source = recipe.recipe_images?.find(img => img.image_type === 'source')
  const img = myVersion ?? source
  if (!img) return null
  return supabase.storage.from('recipe-images').getPublicUrl(img.storage_path).data.publicUrl
}

export default function RecipeCard({ recipe, onToggleFavourite }) {
  const thumbnailUrl = getThumbnailUrl(recipe)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-shadow group">
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="h-44 bg-cream-dark overflow-hidden">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-serif text-base text-stone-800 leading-snug line-clamp-2">{recipe.title}</h3>
          {recipe.cuisine_tag && (
            <span className="mt-2 inline-block text-xs font-sans font-medium bg-sage/10 text-sage-dark px-2 py-0.5 rounded-full">
              {recipe.cuisine_tag}
            </span>
          )}
        </div>
      </Link>
      <div className="px-4 pb-4 flex justify-end">
        <button
          type="button"
          aria-label="favourite"
          data-starred={recipe.is_favourite ? 'true' : 'false'}
          onClick={() => onToggleFavourite({ id: recipe.id, is_favourite: !recipe.is_favourite })}
          className="text-xl leading-none focus:outline-none"
        >
          {recipe.is_favourite ? '★' : '☆'}
        </button>
      </div>
    </div>
  )
}
