import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useRecipe } from '../hooks/useRecipes'
import { useCookSession } from '../hooks/useCookSession'
import { useWakeLock } from '../hooks/useWakeLock'
import { scaleIngredients } from '../utils/scaleIngredients'
import IngredientChecklist from '../components/cook/IngredientChecklist'
import CookStep from '../components/cook/CookStep'
import ServingScaler from '../components/recipe/ServingScaler'
import Spinner from '../components/ui/Spinner'

export default function CookModePage() {
  const { id } = useParams()
  const { data: recipe, isLoading, error } = useRecipe(id)
  const [servings, setServings] = useState(null)
  const [checklistOpen, setChecklistOpen] = useState(true)

  useWakeLock()

  const steps = recipe?.steps ?? []
  const { currentIndex, checkedIngredients, nextStep, prevStep, toggleIngredient } = useCookSession(steps)
  const currentServings = servings ?? recipe?.servings ?? 4
  const scaledIngredients = recipe
    ? scaleIngredients(recipe.ingredients ?? [], recipe.servings ?? currentServings, currentServings)
    : []

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (error) return <p className="p-8 text-red-600 font-sans">{error.message}</p>
  if (!recipe) return null

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to={`/recipe/${id}`} className="text-sm font-sans text-stone-400 hover:text-stone-200">← {recipe.title}</Link>
          <ServingScaler value={currentServings} onChange={setServings} />
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Ingredient checklist */}
          <div className="lg:col-span-2 mb-6 lg:mb-0">
            <button
              type="button"
              onClick={() => setChecklistOpen(o => !o)}
              className="flex items-center gap-2 font-serif text-lg mb-3 lg:pointer-events-none"
            >
              Ingredients
              <span className="lg:hidden text-stone-400 text-sm">{checklistOpen ? '▲' : '▼'}</span>
            </button>
            {checklistOpen && (
              <IngredientChecklist
                ingredients={scaledIngredients}
                checked={checkedIngredients}
                onToggle={toggleIngredient}
              />
            )}
          </div>

          {/* Steps */}
          <div className="lg:col-span-3">
            {steps.length > 0 ? (
              <div className="bg-stone-800 rounded-2xl p-6 space-y-6">
                <CookStep step={steps[currentIndex]} index={currentIndex} total={steps.length} />
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentIndex === 0}
                    className="flex-1 py-3 rounded-xl border border-stone-600 text-stone-300 font-sans text-sm hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={currentIndex === steps.length - 1}
                    className="flex-1 py-3 rounded-xl bg-terracotta text-white font-sans text-sm hover:bg-terracotta-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-stone-400 font-sans text-sm">No steps found for this recipe.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
