import { useState } from 'react'

export function useCookSession(steps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [checkedIngredients, setCheckedIngredients] = useState(new Set())

  function nextStep() {
    setCurrentIndex(i => Math.min(i + 1, steps.length - 1))
  }

  function prevStep() {
    setCurrentIndex(i => Math.max(i - 1, 0))
  }

  function toggleIngredient(index) {
    setCheckedIngredients(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return { currentIndex, checkedIngredients, nextStep, prevStep, toggleIngredient }
}
