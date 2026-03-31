export default function ServingScaler({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-2 bg-cream-dark rounded-lg px-3 py-1.5 border border-stone-200">
      <span className="text-xs font-sans text-stone-500 mr-1">Serves</span>
      <button
        type="button"
        aria-label="−"
        onClick={() => value > 1 && onChange(value - 1)}
        className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:text-terracotta text-base leading-none disabled:opacity-40"
        disabled={value <= 1}
      >
        −
      </button>
      <span className="w-5 text-center font-sans font-medium text-stone-800 text-sm">{value}</span>
      <button
        type="button"
        aria-label="+"
        onClick={() => onChange(value + 1)}
        className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:text-terracotta text-base leading-none"
      >
        +
      </button>
    </div>
  )
}
