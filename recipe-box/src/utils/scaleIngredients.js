export function scaleIngredients(ingredients, baseServings, currentServings) {
  const factor = currentServings / baseServings
  return ingredients.map(ing => ({
    ...ing,
    quantity: ing.quantity !== null && ing.quantity !== undefined
      ? Math.round(ing.quantity * factor * 100) / 100
      : null,
  }))
}
