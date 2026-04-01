// Density in grams per cup for common ingredients
const DENSITY_G_PER_CUP = {
  flour:           125,
  'bread flour':   130,
  sugar:           200,
  'brown sugar':   220,
  'icing sugar':   120,
  butter:          227,
  water:           237,
  milk:            244,
  rice:            185,
  oats:             90,
  salt:            292,
  'cocoa powder':   85,
  honey:           340,
  'olive oil':     216,
  'vegetable oil': 218,
}

export function getDensityOptions() {
  return Object.keys(DENSITY_G_PER_CUP)
}

export function convert(value, from, to, ingredient = null) {
  const n = Number(value)

  // Temperature
  if (from === 'C' && to === 'F') return (n * 9) / 5 + 32
  if (from === 'F' && to === 'C') return ((n - 32) * 5) / 9

  // ml ↔ fl oz
  if (from === 'ml' && to === 'floz') return n / 29.5735
  if (from === 'floz' && to === 'ml') return n * 29.5735

  // tbsp ↔ ml
  if (from === 'tbsp' && to === 'ml') return n * 14.7868
  if (from === 'ml' && to === 'tbsp') return n / 14.7868

  // g ↔ cups (density-aware)
  if (from === 'g' && to === 'cups') {
    const density = DENSITY_G_PER_CUP[ingredient]
    if (!density) return null
    return n / density
  }
  if (from === 'cups' && to === 'g') {
    const density = DENSITY_G_PER_CUP[ingredient]
    if (!density) return null
    return n * density
  }

  return null
}
