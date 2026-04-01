import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useRecipe, useAddMyVersionPhoto, useDeleteRecipe } from '../hooks/useRecipes'
import { scaleIngredients } from '../utils/scaleIngredients'
import { formatQuantity } from '../utils/formatQuantity'
import ServingScaler from '../components/recipe/ServingScaler'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import { supabase } from '../lib/supabase'
import Drawer from '../components/ui/Drawer'
import UnitConverter from '../components/recipe/UnitConverter'

function getImageUrl(recipe, type) {
  const img = recipe.recipe_images?.find(i => i.image_type === type)
  if (!img) return null
  return supabase.storage.from('recipe-images').getPublicUrl(img.storage_path).data.publicUrl
}

export default function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: recipe, isLoading, error } = useRecipe(id)
  const [servings, setServings] = useState(null)
  const [showConverter, setShowConverter] = useState(false)
  const photoInputRef = useRef(null)
  const addMyVersionPhoto = useAddMyVersionPhoto()
  const deleteRecipe = useDeleteRecipe()

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    await addMyVersionPhoto.mutateAsync({ recipeId: id, file })
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (error) return <p className="p-8 text-red-600 font-sans">{error.message}</p>
  if (!recipe) return null

  const currentServings = servings ?? recipe.servings ?? 4
  const scaledIngredients = scaleIngredients(recipe.ingredients ?? [], recipe.servings ?? currentServings, currentServings)
  const heroUrl = getImageUrl(recipe, 'my_version') ?? getImageUrl(recipe, 'generated') ?? getImageUrl(recipe, 'source')

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link to="/" className="text-sm font-sans text-stone-400 hover:text-terracotta mb-6 inline-block">← My Recipe Box</Link>

        {heroUrl && (
          <div className="h-64 rounded-2xl overflow-hidden mb-6">
            <img src={heroUrl} alt={recipe.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="font-serif text-3xl text-stone-800 leading-snug">{recipe.title}</h1>
          <ServingScaler value={currentServings} onChange={setServings} />
        </div>

        <div className="flex flex-wrap gap-3 mb-6 text-sm font-sans text-stone-500">
          {recipe.cuisine_tag && (
            <span className="bg-sage/10 text-sage-dark px-3 py-1 rounded-full text-xs font-medium">{recipe.cuisine_tag}</span>
          )}
          {recipe.prep_time && <span>Prep: {recipe.prep_time}</span>}
          {recipe.cook_time && <span>Cook: {recipe.cook_time}</span>}
        </div>

        <section className="mb-8">
          <h2 className="font-serif text-xl mb-3">Ingredients</h2>
          <ul className="space-y-1.5">
            {scaledIngredients.map((ing, i) => (
              <li key={i} className="flex gap-2 text-sm font-sans text-stone-700">
                <span className="text-terracotta font-medium w-16 shrink-0 text-right">
                  {formatQuantity(ing.quantity)} {ing.unit}
                </span>
                <span>{ing.name}{ing.notes ? ` (${ing.notes})` : ''}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-xl mb-3">Method</h2>
          <ol className="space-y-4">
            {(recipe.steps ?? []).map((step, i) => (
              <li key={i} className="flex gap-3 text-sm font-sans text-stone-700">
                <span className="font-serif text-terracotta font-bold text-base w-5 shrink-0">{i + 1}.</span>
                <span className="leading-relaxed">{step.text}</span>
              </li>
            ))}
          </ol>
        </section>

        {recipe.tips && (
          <section className="mb-8 bg-cream-dark rounded-xl p-4 border border-stone-200">
            <h2 className="font-serif text-lg mb-2">Tips & Notes</h2>
            <p className="text-sm font-sans text-stone-600 leading-relaxed whitespace-pre-wrap">{recipe.tips}</p>
          </section>
        )}

        {recipe.source && (
          <p className="text-sm font-sans text-stone-400 mb-8">Source: {recipe.source}</p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate(`/recipe/${id}/cook`)}>Start Cooking</Button>
          <Button variant="secondary" onClick={() => navigate(`/recipe/${id}/edit`)}>Edit</Button>
          <Button variant="secondary" onClick={() => setShowConverter(v => !v)}>Unit Converter</Button>
          <Button
            variant="secondary"
            onClick={() => photoInputRef.current?.click()}
            disabled={addMyVersionPhoto.isPending}
          >
            {addMyVersionPhoto.isPending ? 'Uploading…' : '📷 Add my photo'}
          </Button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          {addMyVersionPhoto.isError && (
            <p className="w-full text-sm text-red-600 font-sans">{addMyVersionPhoto.error?.message}</p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-stone-200">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Delete this recipe? This cannot be undone.')) {
                deleteRecipe.mutate(id)
              }
            }}
            disabled={deleteRecipe.isPending}
            className="text-sm font-sans text-red-500 hover:text-red-700 disabled:opacity-50"
          >
            {deleteRecipe.isPending ? 'Deleting…' : 'Delete recipe'}
          </button>
          {deleteRecipe.isError && (
            <p className="mt-1 text-sm text-red-600 font-sans">{deleteRecipe.error?.message}</p>
          )}
        </div>
      </div>
      <Drawer open={showConverter} onClose={() => setShowConverter(false)} title="Unit Converter">
        <UnitConverter />
      </Drawer>
    </div>
  )
}
