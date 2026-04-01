import Button from '../ui/Button'

function IngredientRow({ ingredient, onChange, onRemove }) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="number"
        value={ingredient.quantity ?? ''}
        onChange={e => onChange({ ...ingredient, quantity: e.target.value === '' ? null : Number(e.target.value) })}
        placeholder="Qty"
        className="w-20 border border-stone-300 rounded-lg px-2 py-1.5 text-sm font-sans bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40"
      />
      <input
        value={ingredient.unit}
        onChange={e => onChange({ ...ingredient, unit: e.target.value })}
        placeholder="Unit"
        className="w-20 border border-stone-300 rounded-lg px-2 py-1.5 text-sm font-sans bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40"
      />
      <input
        value={ingredient.name}
        onChange={e => onChange({ ...ingredient, name: e.target.value })}
        placeholder="Ingredient name"
        className="flex-1 border border-stone-300 rounded-lg px-2 py-1.5 text-sm font-sans bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40"
      />
      <input
        value={ingredient.notes}
        onChange={e => onChange({ ...ingredient, notes: e.target.value })}
        placeholder="Notes"
        className="w-32 border border-stone-300 rounded-lg px-2 py-1.5 text-sm font-sans bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40"
      />
      <button type="button" onClick={onRemove} className="text-stone-400 hover:text-red-500 text-lg leading-none">×</button>
    </div>
  )
}

function StepRow({ step, index, onChange, onRemove }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="mt-2 w-6 text-sm font-sans text-stone-400 shrink-0">{index + 1}.</span>
      <textarea
        value={step.text}
        onChange={e => onChange({ ...step, text: e.target.value })}
        rows={2}
        className="flex-1 border border-stone-300 rounded-lg px-2 py-1.5 text-sm font-sans bg-white resize-none focus:outline-none focus:ring-2 focus:ring-terracotta/40"
      />
      <button type="button" onClick={onRemove} className="mt-1 text-stone-400 hover:text-red-500 text-lg leading-none">×</button>
    </div>
  )
}

export default function RecipeForm({ values, onChange, onSave, isSaving }) {
  function updateField(field, value) {
    onChange({ ...values, [field]: value })
  }

  function updateIngredient(index, updated) {
    const updated_list = values.ingredients.map((ing, i) => i === index ? updated : ing)
    updateField('ingredients', updated_list)
  }

  function removeIngredient(index) {
    updateField('ingredients', values.ingredients.filter((_, i) => i !== index))
  }

  function addIngredient() {
    updateField('ingredients', [...values.ingredients, { _key: crypto.randomUUID(), quantity: null, unit: '', name: '', notes: '' }])
  }

  function updateStep(index, updated) {
    const updated_list = values.steps.map((s, i) => i === index ? updated : s)
    updateField('steps', updated_list)
  }

  function removeStep(index) {
    updateField('steps', values.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 })))
  }

  function addStep() {
    updateField('steps', [...values.steps, { _key: crypto.randomUUID(), order: values.steps.length + 1, text: '', duration_seconds: null }])
  }

  const inputClass = 'w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-sans bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40'

  return (
    <form onSubmit={e => { e.preventDefault(); onSave() }} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-sans font-medium text-stone-500 mb-1">Title *</label>
          <input value={values.title} onChange={e => updateField('title', e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-sans font-medium text-stone-500 mb-1">Cuisine tag</label>
          <input value={values.cuisine_tag ?? ''} onChange={e => updateField('cuisine_tag', e.target.value)} placeholder="e.g. Italian" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-sans font-medium text-stone-500 mb-1">Servings</label>
          <input type="number" value={values.servings ?? ''} onChange={e => updateField('servings', e.target.value === '' ? null : Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-sans font-medium text-stone-500 mb-1">Prep time</label>
          <input value={values.prep_time ?? ''} onChange={e => updateField('prep_time', e.target.value)} placeholder="e.g. 15 mins" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-sans font-medium text-stone-500 mb-1">Cook time</label>
          <input value={values.cook_time ?? ''} onChange={e => updateField('cook_time', e.target.value)} placeholder="e.g. 30 mins" className={inputClass} />
        </div>
      </div>

      <div>
        <h3 className="font-serif text-lg mb-2">Ingredients</h3>
        <div className="space-y-2">
          {values.ingredients.map((ing, i) => (
            <IngredientRow key={ing._key ?? i} ingredient={ing} onChange={u => updateIngredient(i, u)} onRemove={() => removeIngredient(i)} />
          ))}
        </div>
        <button type="button" onClick={addIngredient} className="mt-2 text-sm text-terracotta hover:text-terracotta-dark font-sans">+ Add ingredient</button>
      </div>

      <div>
        <h3 className="font-serif text-lg mb-2">Steps</h3>
        <div className="space-y-2">
          {values.steps.map((step, i) => (
            <StepRow key={step._key ?? i} step={step} index={i} onChange={u => updateStep(i, u)} onRemove={() => removeStep(i)} />
          ))}
        </div>
        <button type="button" onClick={addStep} className="mt-2 text-sm text-terracotta hover:text-terracotta-dark font-sans">+ Add step</button>
      </div>

      <div>
        <label className="block text-xs font-sans font-medium text-stone-500 mb-1">Tips & notes</label>
        <textarea value={values.tips ?? ''} onChange={e => updateField('tips', e.target.value)} rows={3} className={`${inputClass} resize-none`} />
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Save Recipe'}
      </Button>
    </form>
  )
}
