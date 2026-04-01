import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import HomePage from './pages/HomePage'
import ExtractPage from './pages/ExtractPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import CookModePage from './pages/CookModePage'
import EditRecipePage from './pages/EditRecipePage'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/extract" element={<ExtractPage />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/recipe/:id/cook" element={<CookModePage />} />
          <Route path="/recipe/:id/edit" element={<EditRecipePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
