import { formatQuantity } from '../../utils/formatQuantity'

export default function IngredientChecklist({ ingredients, checked, onToggle }) {
  return (
    <ul className="space-y-2">
      {ingredients.map((ing, i) => (
        <li
          key={i}
          onClick={() => onToggle(i)}
          className={`flex items-center gap-2 cursor-pointer text-sm font-sans py-1 select-none transition-opacity ${
            checked.has(i) ? 'line-through opacity-40' : 'opacity-100'
          }`}
        >
          <span className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center text-xs ${
            checked.has(i) ? 'bg-sage border-sage text-white' : 'border-stone-300'
          }`}>
            {checked.has(i) && '✓'}
          </span>
          <span className="text-terracotta font-medium w-20 text-right shrink-0">
            {formatQuantity(ing.quantity)} {ing.unit}
          </span>
          <span className="text-stone-700">{ing.name}{ing.notes ? ` (${ing.notes})` : ''}</span>
        </li>
      ))}
    </ul>
  )
}
