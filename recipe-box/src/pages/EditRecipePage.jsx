import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRecipe, useUpdateRecipe } from '../hooks/useRecipes'
import RecipeForm from '../components/recipe/RecipeForm'
import Spinner from '../components/ui/Spinner'

export default function EditRecipePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: recipe, isLoading, error } = useRecipe(id)
  const updateRecipe = useUpdateRecipe()
  const [values, setValues] = useState(null)

  useEffect(() => {
    if (recipe && !values) setValues(recipe)
  }, [recipe])

  async function handleSave() {
    await updateRecipe.mutateAsync({ id, recipe: values })
    navigate(`/recipe/${id}`)
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (error) return <p className="p-8 text-red-600 font-sans">{error.message}</p>
  if (!values) return null

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <a href={`/recipe/${id}`} className="text-sm font-sans text-stone-400 hover:text-terracotta mb-6 inline-block">← Back to recipe</a>
        <h1 className="font-serif text-3xl text-stone-800 mb-8">Edit Recipe</h1>
        <RecipeForm
          values={values}
          onChange={setValues}
          onSave={handleSave}
          isSaving={updateRecipe.isPending}
        />
        {updateRecipe.isError && (
          <p className="mt-2 text-sm text-red-600 font-sans">{updateRecipe.error?.message}</p>
        )}
      </div>
    </div>
  )
}
