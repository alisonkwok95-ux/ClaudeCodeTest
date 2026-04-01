import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageUploader from '../components/recipe/ImageUploader'
import RecipeForm from '../components/recipe/RecipeForm'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { useCreateRecipe } from '../hooks/useRecipes'

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
  })
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-recipe`

const EMPTY_RECIPE = {
  title: '', cuisine_tag: '', servings: null,
  prep_time: '', cook_time: '',
  ingredients: [], steps: [], tips: '',
}

export default function ExtractPage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState(null)
  const [recipe, setRecipe] = useState(null)
  const createRecipe = useCreateRecipe()

  async function handleExtract() {
    if (files.length === 0) return
    setExtracting(true)
    setExtractError(null)
    try {
      const images = await Promise.all(files.map(fileToBase64))
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY },
        body: JSON.stringify({ images }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Extraction failed')
      }
      const data = await res.json()
      setRecipe(data)
    } catch (e) {
      setExtractError(e.message)
    } finally {
      setExtracting(false)
    }
  }

  async function handleSave() {
    const saved = await createRecipe.mutateAsync({ recipe, sourceFiles: files })
    navigate(`/recipe/${saved.id}`)
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <a href="/" className="text-sm font-sans text-stone-400 hover:text-terracotta mb-6 inline-block">← Back to collection</a>
        <h1 className="font-serif text-3xl text-stone-800 mb-8">Extract a Recipe</h1>

        {!recipe && (
          <div className="space-y-6">
            <ImageUploader files={files} onChange={setFiles} />
            {extractError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 font-sans">
                {extractError}
              </div>
            )}
            {extracting ? (
              <div className="flex items-center gap-3 text-stone-500 font-sans text-sm">
                <Spinner size="sm" />
                <span>Extracting recipe with Claude…</span>
              </div>
            ) : (
              <Button onClick={handleExtract} disabled={files.length === 0}>
                Extract Recipe
              </Button>
            )}
          </div>
        )}

        {recipe && (
          <div>
            <p className="text-sm font-sans text-sage mb-6">✓ Recipe extracted — review and edit before saving</p>
            <RecipeForm
              values={recipe}
              onChange={setRecipe}
              onSave={handleSave}
              isSaving={createRecipe.isPending}
            />
            {createRecipe.isError && (
              <p className="mt-2 text-sm text-red-600 font-sans">{createRecipe.error?.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
