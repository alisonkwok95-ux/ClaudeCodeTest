export default function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) {
  const base = 'inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-sans font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-terracotta text-white hover:bg-terracotta-dark focus:ring-terracotta',
    secondary: 'bg-cream-dark text-stone-700 border border-stone-300 hover:bg-stone-100 focus:ring-stone-400',
    ghost: 'text-stone-600 hover:bg-stone-100 focus:ring-stone-400',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}
