import { useState } from 'react'
import { convert, getDensityOptions } from '../../utils/convertUnits'
import { formatQuantity } from '../../utils/formatQuantity'

const CONVERSIONS = [
  { label: 'g ↔ cups', from: 'g', to: 'cups', needsIngredient: true },
  { label: 'cups ↔ g', from: 'cups', to: 'g', needsIngredient: true },
  { label: 'ml → fl oz', from: 'ml', to: 'floz', needsIngredient: false },
  { label: 'fl oz → ml', from: 'floz', to: 'ml', needsIngredient: false },
  { label: '°C → °F', from: 'C', to: 'F', needsIngredient: false },
  { label: '°F → °C', from: 'F', to: 'C', needsIngredient: false },
  { label: 'tbsp → ml', from: 'tbsp', to: 'ml', needsIngredient: false },
  { label: 'ml → tbsp', from: 'ml', to: 'tbsp', needsIngredient: false },
]

const UNIT_LABELS = {
  g: 'g', cups: 'cups', ml: 'ml',
  floz: 'fl oz', C: '°C', F: '°F', tbsp: 'tbsp',
}

export default function UnitConverter() {
  const [conversionIndex, setConversionIndex] = useState(0)
  const [input, setInput] = useState('')
  const [ingredient, setIngredient] = useState(getDensityOptions()[0])

  const conv = CONVERSIONS[conversionIndex]
  const result = input !== ''
    ? convert(Number(input), conv.from, conv.to, conv.needsIngredient ? ingredient : null)
    : null

  const inputClass = 'w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-sans bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-sans font-medium text-stone-500 mb-1">Conversion</label>
        <select
          value={conversionIndex}
          onChange={e => { setConversionIndex(Number(e.target.value)); setInput('') }}
          className={inputClass}
        >
          {CONVERSIONS.map((c, i) => <option key={i} value={i}>{c.label}</option>)}
        </select>
      </div>

      {conv.needsIngredient && (
        <div>
          <label className="block text-xs font-sans font-medium text-stone-500 mb-1">Ingredient</label>
          <select value={ingredient} onChange={e => setIngredient(e.target.value)} className={inputClass}>
            {getDensityOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-sans font-medium text-stone-500 mb-1">
          Amount ({UNIT_LABELS[conv.from]})
        </label>
        <input
          type="number"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter amount"
          className={inputClass}
        />
      </div>

      {result !== null && (
        <div className="bg-cream-dark rounded-xl p-4 border border-stone-200">
          <p className="text-xs font-sans text-stone-500 mb-1">Result</p>
          <p className="font-serif text-2xl text-terracotta">
            {formatQuantity(Math.round(result * 100) / 100)}{' '}
            <span className="text-base text-stone-600">{UNIT_LABELS[conv.to]}</span>
          </p>
        </div>
      )}
    </div>
  )
}
