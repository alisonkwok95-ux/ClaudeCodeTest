const FRACTIONS = {
  0.25: '¼',
  0.5: '½',
  0.75: '¾',
  0.33: '⅓',
  0.67: '⅔',
}

export function formatQuantity(qty) {
  if (qty === null || qty === undefined) return ''
  const whole = Math.floor(qty)
  const decimal = Math.round((qty - whole) * 100) / 100
  const fraction = FRACTIONS[decimal]
  if (fraction) return whole === 0 ? fraction : `${whole} ${fraction}`
  return qty % 1 === 0 ? String(qty) : String(parseFloat(qty.toFixed(2)))
}
