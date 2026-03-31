# My Recipe Box — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal recipe collection web app where users upload photos, Claude Vision extracts the recipe, and it's saved to Supabase with cook mode, serving scaler, and unit converter.

**Architecture:** React + Vite SPA with React Router v6 for navigation and TanStack Query v5 for Supabase data fetching. The Anthropic API is called via a Supabase Edge Function so the API key never reaches the browser. All recipe data persists in Supabase Postgres; images in Supabase Storage.

**Tech Stack:** React 18, Vite, Tailwind CSS v3, React Router v6, TanStack Query v5, @supabase/supabase-js, Vitest, @testing-library/react

---

## File Map

```
recipe-box/
├── index.html                          # Google Fonts, app mount
├── vite.config.js                      # Vite + Vitest config
├── tailwind.config.js                  # Custom colors + fonts
├── postcss.config.js
├── package.json
├── .env.local                          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── src/
│   ├── main.jsx                        # React root mount
│   ├── App.jsx                         # Router + QueryClientProvider
│   ├── index.css                       # Tailwind directives + base styles
│   ├── test-setup.js                   # @testing-library/jest-dom
│   ├── lib/
│   │   ├── supabase.js                 # Supabase client singleton
│   │   └── queryClient.js             # TanStack QueryClient singleton
│   ├── utils/
│   │   ├── scaleIngredients.js        # Scale ingredient quantities
│   │   ├── scaleIngredients.test.js
│   │   ├── formatQuantity.js          # Format numbers as fractions
│   │   ├── formatQuantity.test.js
│   │   └── convertUnits.js            # Unit conversion logic
│   │   └── convertUnits.test.js
│   ├── hooks/
│   │   ├── useRecipes.js              # TanStack Query wrappers for Supabase
│   │   ├── useCookSession.js          # Local cook session state
│   │   ├── useCookSession.test.js
│   │   └── useWakeLock.js             # Wake Lock API
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── Drawer.jsx
│   │   ├── recipe/
│   │   │   ├── RecipeCard.jsx
│   │   │   ├── RecipeCard.test.jsx
│   │   │   ├── RecipeForm.jsx
│   │   │   ├── ImageUploader.jsx
│   │   │   ├── ServingScaler.jsx
│   │   │   ├── ServingScaler.test.jsx
│   │   │   └── UnitConverter.jsx
│   │   └── cook/
│   │       ├── IngredientChecklist.jsx
│   │       ├── IngredientChecklist.test.jsx
│   │       ├── CountdownTimer.jsx
│   │       ├── CountdownTimer.test.jsx
│   │       └── CookStep.jsx
│   └── pages/
│       ├── HomePage.jsx
│       ├── ExtractPage.jsx
│       ├── RecipeDetailPage.jsx
│       └── CookModePage.jsx
└── supabase/
    ├── migrations/
    │   └── 20260331000000_initial.sql
    └── functions/
        └── extract-recipe/
            └── index.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `recipe-box/` (new Vite React project)
- Create: `recipe-box/vite.config.js`
- Create: `recipe-box/tailwind.config.js`
- Create: `recipe-box/postcss.config.js`
- Create: `recipe-box/src/test-setup.js`
- Create: `recipe-box/src/lib/supabase.js`
- Create: `recipe-box/src/lib/queryClient.js`
- Create: `recipe-box/src/index.css`
- Create: `recipe-box/index.html`
- Create: `recipe-box/src/main.jsx`
- Create: `recipe-box/src/App.jsx`
- Create: `recipe-box/src/pages/HomePage.jsx` (stub)
- Create: `recipe-box/src/pages/ExtractPage.jsx` (stub)
- Create: `recipe-box/src/pages/RecipeDetailPage.jsx` (stub)
- Create: `recipe-box/src/pages/CookModePage.jsx` (stub)
- Create: `recipe-box/.env.local`

- [ ] **Step 1: Scaffold Vite React project and install dependencies**

```bash
cd "c:/Users/kwoka/OneDrive - PennO365/Desktop/ClaudeCodeTest"
npm create vite@latest recipe-box -- --template react
cd recipe-box
npm install
npm install react-router-dom @tanstack/react-query @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npx tailwindcss init -p
```

- [ ] **Step 2: Write `vite.config.js`**

```js
// recipe-box/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
  },
})
```

- [ ] **Step 3: Write `src/test-setup.js`**

```js
// recipe-box/src/test-setup.js
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Write `tailwind.config.js`**

```js
// recipe-box/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF7F2',
          dark: '#F5F0E8',
        },
        terracotta: {
          DEFAULT: '#C4622D',
          light: '#D4845A',
          dark: '#A3501F',
        },
        sage: {
          DEFAULT: '#7A9E7E',
          light: '#9AB89E',
          dark: '#5C8060',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Write `index.html`** (add Google Fonts)

```html
<!-- recipe-box/index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
    <title>My Recipe Box</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Write `src/index.css`**

```css
/* recipe-box/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-cream font-sans text-stone-800;
  }
}
```

- [ ] **Step 7: Write `.env.local`**

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- [ ] **Step 8: Write `src/lib/supabase.js`**

```js
// recipe-box/src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- [ ] **Step 9: Write `src/lib/queryClient.js`**

```js
// recipe-box/src/lib/queryClient.js
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})
```

- [ ] **Step 10: Write stub pages**

```jsx
// recipe-box/src/pages/HomePage.jsx
export default function HomePage() {
  return <div className="p-8"><h1 className="font-serif text-3xl">My Recipe Box</h1></div>
}
```

```jsx
// recipe-box/src/pages/ExtractPage.jsx
export default function ExtractPage() {
  return <div className="p-8"><h1 className="font-serif text-3xl">Extract Recipe</h1></div>
}
```

```jsx
// recipe-box/src/pages/RecipeDetailPage.jsx
export default function RecipeDetailPage() {
  return <div className="p-8"><h1 className="font-serif text-3xl">Recipe</h1></div>
}
```

```jsx
// recipe-box/src/pages/CookModePage.jsx
export default function CookModePage() {
  return <div className="p-8"><h1 className="font-serif text-3xl">Cook Mode</h1></div>
}
```

- [ ] **Step 11: Write `src/main.jsx`**

```jsx
// recipe-box/src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 12: Write `src/App.jsx`**

```jsx
// recipe-box/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import HomePage from './pages/HomePage'
import ExtractPage from './pages/ExtractPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import CookModePage from './pages/CookModePage'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/extract" element={<ExtractPage />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/recipe/:id/cook" element={<CookModePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 13: Verify dev server starts**

```bash
cd "c:/Users/kwoka/OneDrive - PennO365/Desktop/ClaudeCodeTest/recipe-box"
npm run dev
```

Expected: dev server at http://localhost:5173 with cream background and "My Recipe Box" heading.

- [ ] **Step 14: Verify tests run**

```bash
npm test -- --run
```

Expected: no test files found yet, but runner exits cleanly with exit code 0.

- [ ] **Step 15: Commit**

```bash
git add recipe-box/
git commit -m "feat: scaffold recipe-box React + Vite + Tailwind app"
```

---

## Task 2: Supabase Schema + Edge Function

**Files:**
- Create: `recipe-box/supabase/migrations/20260331000000_initial.sql`
- Create: `recipe-box/supabase/functions/extract-recipe/index.ts`

- [ ] **Step 1: Write the SQL migration**

```sql
-- recipe-box/supabase/migrations/20260331000000_initial.sql

create table recipes (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  cuisine_tag  text,
  servings     integer,
  prep_time    text,
  cook_time    text,
  ingredients  jsonb default '[]'::jsonb,
  steps        jsonb default '[]'::jsonb,
  tips         text,
  is_favourite boolean default false,
  created_at   timestamptz default now()
);

create table recipe_images (
  id            uuid primary key default gen_random_uuid(),
  recipe_id     uuid references recipes(id) on delete cascade,
  storage_path  text not null,
  image_type    text not null check (image_type in ('source', 'my_version')),
  created_at    timestamptz default now()
);

-- Single-user app: disable RLS for simplicity
alter table recipes disable row level security;
alter table recipe_images disable row level security;
```

- [ ] **Step 2: Apply migration in Supabase dashboard**

Go to your Supabase project → SQL Editor → paste the migration SQL → Run.

Then go to Storage → New bucket → name it `recipe-images` → set to Public → Save.

- [ ] **Step 3: Write the Edge Function**

```ts
// recipe-box/supabase/functions/extract-recipe/index.ts
import Anthropic from "npm:@anthropic-ai/sdk"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { images } = await req.json()

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(
        JSON.stringify({ error: "images array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") })

    const imageContent = images.map((dataUrl: string) => {
      const [header, data] = dataUrl.split(",")
      const mediaType = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg"
      return {
        type: "image" as const,
        source: { type: "base64" as const, media_type: mediaType as "image/jpeg" | "image/png" | "image/webp", data },
      }
    })

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract the recipe from the provided image(s) and return ONLY valid JSON with this exact structure:
{
  "title": "string",
  "servings": number,
  "prep_time": "string (e.g. '15 mins')",
  "cook_time": "string (e.g. '30 mins')",
  "ingredients": [{"quantity": number, "unit": "string", "name": "string", "notes": "string"}],
  "steps": [{"order": number, "text": "string", "duration_seconds": number | null}],
  "tips": "string | null"
}
For duration_seconds: detect time durations in step text (e.g. "simmer for 10 minutes" → 600, "bake for 1 hour" → 3600, "rest for 30 seconds" → 30). Set to null if no duration found.
Return ONLY the JSON object. No markdown code fences. No explanation.`,
            },
            ...imageContent,
          ],
        },
      ],
    })

    const text = (response.content[0] as { type: "text"; text: string }).text.trim()
    const recipe = JSON.parse(text)

    return new Response(JSON.stringify(recipe), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
```

- [ ] **Step 4: Deploy the Edge Function**

Install the Supabase CLI if not already installed:
```bash
npm install -g supabase
```

Then from the `recipe-box/` directory:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_key
supabase functions deploy extract-recipe --project-ref YOUR_PROJECT_REF
```

Find `YOUR_PROJECT_REF` in your Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`.

- [ ] **Step 5: Verify the Edge Function URL**

In your Supabase dashboard → Edge Functions → `extract-recipe` → copy the function URL. It will look like:
`https://YOUR_PROJECT_REF.supabase.co/functions/v1/extract-recipe`

- [ ] **Step 6: Commit**

```bash
cd "c:/Users/kwoka/OneDrive - PennO365/Desktop/ClaudeCodeTest"
git add recipe-box/supabase/
git commit -m "feat: add Supabase schema migration and extract-recipe Edge Function"
```

---

## Task 3: Recipe Extraction Flow

**Files:**
- Create: `src/components/ui/Button.jsx`
- Create: `src/components/ui/Spinner.jsx`
- Create: `src/components/recipe/ImageUploader.jsx`
- Create: `src/components/recipe/RecipeForm.jsx`
- Create: `src/hooks/useRecipes.js`
- Modify: `src/pages/ExtractPage.jsx`

- [ ] **Step 1: Write `Button` UI component**

```jsx
// recipe-box/src/components/ui/Button.jsx
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
```

- [ ] **Step 2: Write `Spinner` UI component**

```jsx
// recipe-box/src/components/ui/Spinner.jsx
export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <svg className={`animate-spin text-terracotta ${sizes[size]} ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
```

- [ ] **Step 3: Write `useRecipes.js` hook**

```js
// recipe-box/src/hooks/useRecipes.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useRecipeList() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*, recipe_images(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useRecipe(id) {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*, recipe_images(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateRecipe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ recipe, sourceFiles }) => {
      const { data, error } = await supabase
        .from('recipes')
        .insert(recipe)
        .select()
        .single()
      if (error) throw error

      for (const file of sourceFiles) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `source/${data.id}/${safeName}`
        const { error: uploadError } = await supabase.storage
          .from('recipe-images')
          .upload(path, file)
        if (uploadError) throw uploadError

        const { error: imgError } = await supabase
          .from('recipe_images')
          .insert({ recipe_id: data.id, storage_path: path, image_type: 'source' })
        if (imgError) throw imgError
      }

      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  })
}

export function useToggleFavourite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_favourite }) => {
      const { error } = await supabase
        .from('recipes')
        .update({ is_favourite })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  })
}

export function useAddMyVersionPhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ recipeId, file }) => {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `my-version/${recipeId}/${safeName}`
      const { error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(path, file)
      if (uploadError) throw uploadError

      const { error } = await supabase
        .from('recipe_images')
        .insert({ recipe_id: recipeId, storage_path: path, image_type: 'my_version' })
      if (error) throw error
    },
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', recipeId] })
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}
```

- [ ] **Step 4: Write `ImageUploader` component**

```jsx
// recipe-box/src/components/recipe/ImageUploader.jsx
import { useRef, useState } from 'react'

export default function ImageUploader({ files, onChange }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFiles(newFiles) {
    const accepted = Array.from(newFiles)
      .filter(f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type))
      .slice(0, 3 - files.length)
    if (accepted.length > 0) onChange([...files, ...accepted].slice(0, 3))
  }

  function removeFile(index) {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-terracotta bg-terracotta/5' : 'border-stone-300 hover:border-terracotta/60'
        } ${files.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <p className="text-stone-500 font-sans text-sm">
          {files.length >= 3
            ? 'Maximum 3 images uploaded'
            : 'Drop recipe screenshots here, or click to browse'}
        </p>
        <p className="text-stone-400 font-sans text-xs mt-1">JPEG, PNG, WEBP · max 10MB each · up to 3 images</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      {files.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {files.map((file, i) => (
            <div key={i} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={`Upload ${i + 1}`}
                className="h-24 w-24 object-cover rounded-lg border border-stone-200"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute -top-2 -right-2 bg-white border border-stone-300 rounded-full w-5 h-5 flex items-center justify-center text-stone-500 hover:text-red-500 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Write `RecipeForm` component**

```jsx
// recipe-box/src/components/recipe/RecipeForm.jsx
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
    updateField('ingredients', [...values.ingredients, { quantity: null, unit: '', name: '', notes: '' }])
  }

  function updateStep(index, updated) {
    const updated_list = values.steps.map((s, i) => i === index ? updated : s)
    updateField('steps', updated_list)
  }

  function removeStep(index) {
    updateField('steps', values.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 })))
  }

  function addStep() {
    updateField('steps', [...values.steps, { order: values.steps.length + 1, text: '', duration_seconds: null }])
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
            <IngredientRow key={i} ingredient={ing} onChange={u => updateIngredient(i, u)} onRemove={() => removeIngredient(i)} />
          ))}
        </div>
        <button type="button" onClick={addIngredient} className="mt-2 text-sm text-terracotta hover:text-terracotta-dark font-sans">+ Add ingredient</button>
      </div>

      <div>
        <h3 className="font-serif text-lg mb-2">Steps</h3>
        <div className="space-y-2">
          {values.steps.map((step, i) => (
            <StepRow key={i} step={step} index={i} onChange={u => updateStep(i, u)} onRemove={() => removeStep(i)} />
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
```

- [ ] **Step 6: Write `ExtractPage`**

```jsx
// recipe-box/src/pages/ExtractPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ImageUploader from '../components/recipe/ImageUploader'
import RecipeForm from '../components/recipe/RecipeForm'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { useCreateRecipe } from '../hooks/useRecipes'

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
  })
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-recipe`

const EMPTY_RECIPE = {
  title: '', cuisine_tag: '', servings: null,
  prep_time: '', cook_time: '',
  ingredients: [], steps: [], tips: '',
}

export default function ExtractPage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState(null)
  const [recipe, setRecipe] = useState(null)
  const createRecipe = useCreateRecipe()

  async function handleExtract() {
    if (files.length === 0) return
    setExtracting(true)
    setExtractError(null)
    try {
      const images = await Promise.all(files.map(fileToBase64))
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY },
        body: JSON.stringify({ images }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Extraction failed')
      }
      const data = await res.json()
      setRecipe(data)
    } catch (e) {
      setExtractError(e.message)
    } finally {
      setExtracting(false)
    }
  }

  async function handleSave() {
    const saved = await createRecipe.mutateAsync({ recipe, sourceFiles: files })
    navigate(`/recipe/${saved.id}`)
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <a href="/" className="text-sm font-sans text-stone-400 hover:text-terracotta mb-6 inline-block">← Back to collection</a>
        <h1 className="font-serif text-3xl text-stone-800 mb-8">Extract a Recipe</h1>

        {!recipe && (
          <div className="space-y-6">
            <ImageUploader files={files} onChange={setFiles} />
            {extractError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 font-sans">
                {extractError}
              </div>
            )}
            {extracting ? (
              <div className="flex items-center gap-3 text-stone-500 font-sans text-sm">
                <Spinner size="sm" />
                <span>Extracting recipe with Claude…</span>
              </div>
            ) : (
              <Button onClick={handleExtract} disabled={files.length === 0}>
                Extract Recipe
              </Button>
            )}
          </div>
        )}

        {recipe && (
          <div>
            <p className="text-sm font-sans text-sage mb-6">✓ Recipe extracted — review and edit before saving</p>
            <RecipeForm
              values={recipe}
              onChange={setRecipe}
              onSave={handleSave}
              isSaving={createRecipe.isPending}
            />
            {createRecipe.isError && (
              <p className="mt-2 text-sm text-red-600 font-sans">{createRecipe.error?.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Verify extraction flow manually in browser**

1. Fill in `.env.local` with real Supabase URL and anon key
2. `npm run dev` → navigate to http://localhost:5173/extract
3. Upload a recipe screenshot → click Extract Recipe
4. Confirm the form populates with extracted data
5. Click Save Recipe → should redirect to `/recipe/:id`

- [ ] **Step 8: Commit**

```bash
cd "c:/Users/kwoka/OneDrive - PennO365/Desktop/ClaudeCodeTest"
git add recipe-box/
git commit -m "feat: add recipe extraction flow with Claude Vision and RecipeForm"
```

---

## Task 4: Collection Browse (HomePage)

**Files:**
- Create: `src/components/recipe/RecipeCard.jsx`
- Create: `src/components/recipe/RecipeCard.test.jsx`
- Modify: `src/pages/HomePage.jsx`

- [ ] **Step 1: Write failing `RecipeCard` test**

```jsx
// recipe-box/src/components/recipe/RecipeCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import RecipeCard from './RecipeCard'

const recipe = {
  id: 'abc-123',
  title: 'Pasta al Limone',
  cuisine_tag: 'Italian',
  is_favourite: false,
  recipe_images: [],
}

describe('RecipeCard', () => {
  it('renders title and cuisine tag', () => {
    render(<RecipeCard recipe={recipe} onToggleFavourite={vi.fn()} />)
    expect(screen.getByText('Pasta al Limone')).toBeInTheDocument()
    expect(screen.getByText('Italian')).toBeInTheDocument()
  })

  it('calls onToggleFavourite with toggled value when star clicked', () => {
    const onToggle = vi.fn()
    render(<RecipeCard recipe={recipe} onToggleFavourite={onToggle} />)
    fireEvent.click(screen.getByRole('button', { name: /favourite/i }))
    expect(onToggle).toHaveBeenCalledWith({ id: 'abc-123', is_favourite: true })
  })

  it('shows filled star when is_favourite is true', () => {
    render(<RecipeCard recipe={{ ...recipe, is_favourite: true }} onToggleFavourite={vi.fn()} />)
    expect(screen.getByRole('button', { name: /favourite/i })).toHaveAttribute('data-starred', 'true')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd "c:/Users/kwoka/OneDrive - PennO365/Desktop/ClaudeCodeTest/recipe-box"
npm test -- --run src/components/recipe/RecipeCard.test.jsx
```

Expected: FAIL — `RecipeCard` is not implemented yet.

- [ ] **Step 3: Write `RecipeCard` component**

```jsx
// recipe-box/src/components/recipe/RecipeCard.jsx
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function getThumbnailUrl(recipe) {
  const myVersion = recipe.recipe_images?.find(img => img.image_type === 'my_version')
  const source = recipe.recipe_images?.find(img => img.image_type === 'source')
  const img = myVersion ?? source
  if (!img) return null
  return supabase.storage.from('recipe-images').getPublicUrl(img.storage_path).data.publicUrl
}

export default function RecipeCard({ recipe, onToggleFavourite }) {
  const thumbnailUrl = getThumbnailUrl(recipe)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-shadow group">
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="h-44 bg-cream-dark overflow-hidden">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-serif text-base text-stone-800 leading-snug line-clamp-2">{recipe.title}</h3>
          {recipe.cuisine_tag && (
            <span className="mt-2 inline-block text-xs font-sans font-medium bg-sage/10 text-sage-dark px-2 py-0.5 rounded-full">
              {recipe.cuisine_tag}
            </span>
          )}
        </div>
      </Link>
      <div className="px-4 pb-4 flex justify-end">
        <button
          type="button"
          aria-label="favourite"
          data-starred={recipe.is_favourite ? 'true' : 'false'}
          onClick={() => onToggleFavourite({ id: recipe.id, is_favourite: !recipe.is_favourite })}
          className="text-xl leading-none focus:outline-none"
        >
          {recipe.is_favourite ? '★' : '☆'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm test -- --run src/components/recipe/RecipeCard.test.jsx
```

Expected: 3 tests PASS.

- [ ] **Step 5: Write `HomePage`**

```jsx
// recipe-box/src/pages/HomePage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecipeList, useToggleFavourite } from '../hooks/useRecipes'
import RecipeCard from '../components/recipe/RecipeCard'
import Spinner from '../components/ui/Spinner'

export default function HomePage() {
  const { data: recipes, isLoading, error } = useRecipeList()
  const toggleFavourite = useToggleFavourite()
  const [search, setSearch] = useState('')
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false)

  const filtered = (recipes ?? [])
    .filter(r => !showFavouritesOnly || r.is_favourite)
    .filter(r => r.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-4xl text-stone-800">My Recipe Box</h1>
        </div>

        <div className="flex gap-3 mb-8">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search recipes…"
            className="flex-1 border border-stone-300 rounded-lg px-4 py-2.5 text-sm font-sans bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          />
          <button
            type="button"
            onClick={() => setShowFavouritesOnly(v => !v)}
            className={`px-4 py-2.5 rounded-lg text-sm font-sans font-medium border transition-colors ${
              showFavouritesOnly
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-white text-stone-600 border-stone-300 hover:border-terracotta/60'
            }`}
          >
            ★ Favourites
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20"><Spinner /></div>
        )}

        {error && (
          <p className="text-red-600 font-sans text-sm">{error.message}</p>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-stone-400 font-sans py-20">
            {recipes?.length === 0 ? 'No recipes yet. Add your first one!' : 'No recipes match your search.'}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onToggleFavourite={toggleFavourite.mutate}
            />
          ))}
        </div>
      </div>

      {/* FAB */}
      <Link
        to="/extract"
        className="fixed bottom-6 right-6 bg-terracotta text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-terracotta-dark transition-colors"
        aria-label="Add recipe"
      >
        +
      </Link>
    </div>
  )
}
```

- [ ] **Step 6: Verify manually in browser**

Navigate to http://localhost:5173 — should show the recipe grid with any saved recipes.

- [ ] **Step 7: Commit**

```bash
cd "c:/Users/kwoka/OneDrive - PennO365/Desktop/ClaudeCodeTest"
git add recipe-box/
git commit -m "feat: add homepage recipe grid with search and favourites filter"
```

---

## Task 5: Recipe Detail Page + Serving Scaler

**Files:**
- Create: `src/utils/formatQuantity.js`
- Create: `src/utils/formatQuantity.test.js`
- Create: `src/utils/scaleIngredients.js`
- Create: `src/utils/scaleIngredients.test.js`
- Create: `src/components/recipe/ServingScaler.jsx`
- Create: `src/components/recipe/ServingScaler.test.jsx`
- Modify: `src/pages/RecipeDetailPage.jsx`

- [ ] **Step 1: Write failing `formatQuantity` tests**

```js
// recipe-box/src/utils/formatQuantity.test.js
import { describe, it, expect } from 'vitest'
import { formatQuantity } from './formatQuantity'

describe('formatQuantity', () => {
  it('returns whole number as string', () => {
    expect(formatQuantity(2)).toBe('2')
  })
  it('returns 0.5 as ½', () => {
    expect(formatQuantity(0.5)).toBe('½')
  })
  it('returns 0.25 as ¼', () => {
    expect(formatQuantity(0.25)).toBe('¼')
  })
  it('returns 0.75 as ¾', () => {
    expect(formatQuantity(0.75)).toBe('¾')
  })
  it('returns 0.33 as ⅓', () => {
    expect(formatQuantity(0.33)).toBe('⅓')
  })
  it('returns 0.67 as ⅔', () => {
    expect(formatQuantity(0.67)).toBe('⅔')
  })
  it('returns 1.5 as 1 ½', () => {
    expect(formatQuantity(1.5)).toBe('1 ½')
  })
  it('returns 2.25 as 2 ¼', () => {
    expect(formatQuantity(2.25)).toBe('2 ¼')
  })
  it('returns decimal with no clean fraction as trimmed string', () => {
    expect(formatQuantity(1.2)).toBe('1.2')
  })
  it('returns null as empty string', () => {
    expect(formatQuantity(null)).toBe('')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- --run src/utils/formatQuantity.test.js
```

Expected: FAIL.

- [ ] **Step 3: Write `formatQuantity.js`**

```js
// recipe-box/src/utils/formatQuantity.js
const FRACTIONS = {
  0.25: '¼',
  0.5: '½',
  0.75: '¾',
  0.33: '⅓',
  0.67: '⅔',
  0.2: '⅕',
  0.4: '⅖',
  0.6: '⅗',
  0.8: '⅘',
}

export function formatQuantity(qty) {
  if (qty === null || qty === undefined) return ''
  const whole = Math.floor(qty)
  const decimal = Math.round((qty - whole) * 100) / 100
  const fraction = FRACTIONS[decimal]
  if (fraction) return whole === 0 ? fraction : `${whole} ${fraction}`
  return qty % 1 === 0 ? String(qty) : String(parseFloat(qty.toFixed(2)))
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm test -- --run src/utils/formatQuantity.test.js
```

Expected: 10 tests PASS.

- [ ] **Step 5: Write failing `scaleIngredients` tests**

```js
// recipe-box/src/utils/scaleIngredients.test.js
import { describe, it, expect } from 'vitest'
import { scaleIngredients } from './scaleIngredients'

const base = [
  { quantity: 400, unit: 'g', name: 'pasta', notes: '' },
  { quantity: 2, unit: 'tbsp', name: 'olive oil', notes: '' },
  { quantity: null, unit: 'pinch', name: 'salt', notes: '' },
]

describe('scaleIngredients', () => {
  it('returns same quantities when serving count unchanged', () => {
    const result = scaleIngredients(base, 4, 4)
    expect(result[0].quantity).toBe(400)
  })

  it('halves quantities when servings halved', () => {
    const result = scaleIngredients(base, 4, 2)
    expect(result[0].quantity).toBe(200)
    expect(result[1].quantity).toBe(1)
  })

  it('doubles quantities when servings doubled', () => {
    const result = scaleIngredients(base, 4, 8)
    expect(result[0].quantity).toBe(800)
  })

  it('leaves null quantity as null', () => {
    const result = scaleIngredients(base, 4, 8)
    expect(result[2].quantity).toBeNull()
  })

  it('preserves non-quantity fields', () => {
    const result = scaleIngredients(base, 4, 2)
    expect(result[0].unit).toBe('g')
    expect(result[0].name).toBe('pasta')
  })

  it('rounds to 2 decimal places', () => {
    const result = scaleIngredients([{ quantity: 1, unit: 'cup', name: 'flour', notes: '' }], 3, 2)
    expect(result[0].quantity).toBe(0.67)
  })
})
```

- [ ] **Step 6: Run test to confirm it fails**

```bash
npm test -- --run src/utils/scaleIngredients.test.js
```

Expected: FAIL.

- [ ] **Step 7: Write `scaleIngredients.js`**

```js
// recipe-box/src/utils/scaleIngredients.js
export function scaleIngredients(ingredients, baseServings, currentServings) {
  const factor = currentServings / baseServings
  return ingredients.map(ing => ({
    ...ing,
    quantity: ing.quantity !== null && ing.quantity !== undefined
      ? Math.round(ing.quantity * factor * 100) / 100
      : null,
  }))
}
```

- [ ] **Step 8: Run test to confirm it passes**

```bash
npm test -- --run src/utils/scaleIngredients.test.js
```

Expected: 6 tests PASS.

- [ ] **Step 9: Write failing `ServingScaler` tests**

```jsx
// recipe-box/src/components/recipe/ServingScaler.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ServingScaler from './ServingScaler'

describe('ServingScaler', () => {
  it('renders current servings', () => {
    render(<ServingScaler value={4} onChange={vi.fn()} />)
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('calls onChange with incremented value when + clicked', () => {
    const onChange = vi.fn()
    render(<ServingScaler value={4} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('calls onChange with decremented value when − clicked', () => {
    const onChange = vi.fn()
    render(<ServingScaler value={4} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '−' }))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('does not go below 1', () => {
    const onChange = vi.fn()
    render(<ServingScaler value={1} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '−' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 10: Run test to confirm it fails**

```bash
npm test -- --run src/components/recipe/ServingScaler.test.jsx
```

Expected: FAIL.

- [ ] **Step 11: Write `ServingScaler` component**

```jsx
// recipe-box/src/components/recipe/ServingScaler.jsx
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
```

- [ ] **Step 12: Run test to confirm it passes**

```bash
npm test -- --run src/components/recipe/ServingScaler.test.jsx
```

Expected: 4 tests PASS.

- [ ] **Step 13: Write `RecipeDetailPage`**

```jsx
// recipe-box/src/pages/RecipeDetailPage.jsx
import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useRecipe } from '../hooks/useRecipes'
import { scaleIngredients } from '../utils/scaleIngredients'
import { formatQuantity } from '../utils/formatQuantity'
import ServingScaler from '../components/recipe/ServingScaler'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import { supabase } from '../lib/supabase'

function getImageUrl(recipe, type) {
  const img = recipe.recipe_images?.find(i => i.image_type === type)
    ?? recipe.recipe_images?.[0]
  if (!img) return null
  return supabase.storage.from('recipe-images').getPublicUrl(img.storage_path).data.publicUrl
}

export default function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: recipe, isLoading, error } = useRecipe(id)
  const [servings, setServings] = useState(null)
  const [showConverter, setShowConverter] = useState(false)

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (error) return <p className="p-8 text-red-600 font-sans">{error.message}</p>
  if (!recipe) return null

  const currentServings = servings ?? recipe.servings ?? 4
  const scaledIngredients = scaleIngredients(recipe.ingredients ?? [], recipe.servings ?? currentServings, currentServings)
  const heroUrl = getImageUrl(recipe, 'my_version') ?? getImageUrl(recipe, 'source')

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link to="/" className="text-sm font-sans text-stone-400 hover:text-terracotta mb-6 inline-block">← My Recipe Box</Link>

        {heroUrl && (
          <div className="h-64 rounded-2xl overflow-hidden mb-6">
            <img src={heroUrl} alt={recipe.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="font-serif text-3xl text-stone-800 leading-snug">{recipe.title}</h1>
          <ServingScaler value={currentServings} onChange={setServings} />
        </div>

        <div className="flex flex-wrap gap-3 mb-6 text-sm font-sans text-stone-500">
          {recipe.cuisine_tag && (
            <span className="bg-sage/10 text-sage-dark px-3 py-1 rounded-full text-xs font-medium">{recipe.cuisine_tag}</span>
          )}
          {recipe.prep_time && <span>Prep: {recipe.prep_time}</span>}
          {recipe.cook_time && <span>Cook: {recipe.cook_time}</span>}
        </div>

        <section className="mb-8">
          <h2 className="font-serif text-xl mb-3">Ingredients</h2>
          <ul className="space-y-1.5">
            {scaledIngredients.map((ing, i) => (
              <li key={i} className="flex gap-2 text-sm font-sans text-stone-700">
                <span className="text-terracotta font-medium w-16 shrink-0 text-right">
                  {formatQuantity(ing.quantity)} {ing.unit}
                </span>
                <span>{ing.name}{ing.notes ? ` (${ing.notes})` : ''}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-xl mb-3">Method</h2>
          <ol className="space-y-4">
            {(recipe.steps ?? []).map((step, i) => (
              <li key={i} className="flex gap-3 text-sm font-sans text-stone-700">
                <span className="font-serif text-terracotta font-bold text-base w-5 shrink-0">{i + 1}.</span>
                <span className="leading-relaxed">{step.text}</span>
              </li>
            ))}
          </ol>
        </section>

        {recipe.tips && (
          <section className="mb-8 bg-cream-dark rounded-xl p-4 border border-stone-200">
            <h2 className="font-serif text-lg mb-2">Tips & Notes</h2>
            <p className="text-sm font-sans text-stone-600 leading-relaxed">{recipe.tips}</p>
          </section>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate(`/recipe/${id}/cook`)}>Start Cooking</Button>
          <Button variant="secondary" onClick={() => setShowConverter(v => !v)}>Unit Converter</Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 14: Verify in browser**

Navigate to a saved recipe URL — should see title, hero image, scaled ingredients, steps, and the Start Cooking button.

- [ ] **Step 15: Commit**

```bash
cd "c:/Users/kwoka/OneDrive - PennO365/Desktop/ClaudeCodeTest"
git add recipe-box/
git commit -m "feat: add recipe detail page with serving scaler"
```

---

## Task 6: Cook Mode

**Files:**
- Create: `src/hooks/useCookSession.js`
- Create: `src/hooks/useCookSession.test.js`
- Create: `src/hooks/useWakeLock.js`
- Create: `src/components/cook/IngredientChecklist.jsx`
- Create: `src/components/cook/IngredientChecklist.test.jsx`
- Create: `src/components/cook/CountdownTimer.jsx`
- Create: `src/components/cook/CountdownTimer.test.jsx`
- Create: `src/components/cook/CookStep.jsx`
- Modify: `src/pages/CookModePage.jsx`

- [ ] **Step 1: Write failing `useCookSession` tests**

```js
// recipe-box/src/hooks/useCookSession.test.js
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCookSession } from './useCookSession'

const steps = [
  { order: 1, text: 'Boil water', duration_seconds: null },
  { order: 2, text: 'Cook pasta', duration_seconds: 600 },
  { order: 3, text: 'Drain pasta', duration_seconds: null },
]

describe('useCookSession', () => {
  it('starts on step 0', () => {
    const { result } = renderHook(() => useCookSession(steps))
    expect(result.current.currentIndex).toBe(0)
  })

  it('advances to next step', () => {
    const { result } = renderHook(() => useCookSession(steps))
    act(() => result.current.nextStep())
    expect(result.current.currentIndex).toBe(1)
  })

  it('does not advance past last step', () => {
    const { result } = renderHook(() => useCookSession(steps))
    act(() => result.current.nextStep())
    act(() => result.current.nextStep())
    act(() => result.current.nextStep())
    expect(result.current.currentIndex).toBe(2)
  })

  it('goes back to previous step', () => {
    const { result } = renderHook(() => useCookSession(steps))
    act(() => result.current.nextStep())
    act(() => result.current.prevStep())
    expect(result.current.currentIndex).toBe(0)
  })

  it('does not go before step 0', () => {
    const { result } = renderHook(() => useCookSession(steps))
    act(() => result.current.prevStep())
    expect(result.current.currentIndex).toBe(0)
  })

  it('toggles ingredient check state', () => {
    const { result } = renderHook(() => useCookSession(steps))
    act(() => result.current.toggleIngredient(0))
    expect(result.current.checkedIngredients.has(0)).toBe(true)
    act(() => result.current.toggleIngredient(0))
    expect(result.current.checkedIngredients.has(0)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- --run src/hooks/useCookSession.test.js
```

Expected: FAIL.

- [ ] **Step 3: Write `useCookSession.js`**

```js
// recipe-box/src/hooks/useCookSession.js
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
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm test -- --run src/hooks/useCookSession.test.js
```

Expected: 6 tests PASS.

- [ ] **Step 5: Write `useWakeLock.js`**

```js
// recipe-box/src/hooks/useWakeLock.js
import { useEffect, useRef } from 'react'

export function useWakeLock() {
  const wakeLockRef = useRef(null)

  useEffect(() => {
    async function acquire() {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        } catch {
          // silently degrade — some browsers/contexts block wake lock
        }
      }
    }
    acquire()
    return () => {
      wakeLockRef.current?.release()
      wakeLockRef.current = null
    }
  }, [])
}
```

- [ ] **Step 6: Write failing `IngredientChecklist` tests**

```jsx
// recipe-box/src/components/cook/IngredientChecklist.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import IngredientChecklist from './IngredientChecklist'

const ingredients = [
  { quantity: 400, unit: 'g', name: 'pasta', notes: '' },
  { quantity: 2, unit: 'tbsp', name: 'olive oil', notes: '' },
]

describe('IngredientChecklist', () => {
  it('renders all ingredients', () => {
    render(<IngredientChecklist ingredients={ingredients} checked={new Set()} onToggle={vi.fn()} />)
    expect(screen.getByText(/pasta/)).toBeInTheDocument()
    expect(screen.getByText(/olive oil/)).toBeInTheDocument()
  })

  it('calls onToggle with index when item clicked', () => {
    const onToggle = vi.fn()
    render(<IngredientChecklist ingredients={ingredients} checked={new Set()} onToggle={onToggle} />)
    fireEvent.click(screen.getByText(/pasta/).closest('li'))
    expect(onToggle).toHaveBeenCalledWith(0)
  })

  it('applies strikethrough style for checked items', () => {
    render(<IngredientChecklist ingredients={ingredients} checked={new Set([0])} onToggle={vi.fn()} />)
    const item = screen.getByText(/pasta/).closest('li')
    expect(item).toHaveClass('line-through')
  })
})
```

- [ ] **Step 7: Run test to confirm it fails**

```bash
npm test -- --run src/components/cook/IngredientChecklist.test.jsx
```

Expected: FAIL.

- [ ] **Step 8: Write `IngredientChecklist` component**

```jsx
// recipe-box/src/components/cook/IngredientChecklist.jsx
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
```

- [ ] **Step 9: Run test to confirm it passes**

```bash
npm test -- --run src/components/cook/IngredientChecklist.test.jsx
```

Expected: 3 tests PASS.

- [ ] **Step 10: Write failing `CountdownTimer` tests**

```jsx
// recipe-box/src/components/cook/CountdownTimer.test.jsx
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import CountdownTimer from './CountdownTimer'

describe('CountdownTimer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('displays formatted time on render', () => {
    render(<CountdownTimer seconds={90} />)
    expect(screen.getByText('01:30')).toBeInTheDocument()
  })

  it('starts counting down when clicked', () => {
    render(<CountdownTimer seconds={90} />)
    fireEvent.click(screen.getByRole('button'))
    act(() => vi.advanceTimersByTime(3000))
    expect(screen.getByText('01:27')).toBeInTheDocument()
  })

  it('pauses when clicked again while running', () => {
    render(<CountdownTimer seconds={90} />)
    fireEvent.click(screen.getByRole('button'))
    act(() => vi.advanceTimersByTime(3000))
    fireEvent.click(screen.getByRole('button'))
    act(() => vi.advanceTimersByTime(3000))
    expect(screen.getByText('01:27')).toBeInTheDocument()
  })

  it('stops at 00:00', () => {
    render(<CountdownTimer seconds={3} />)
    fireEvent.click(screen.getByRole('button'))
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })
})
```

- [ ] **Step 11: Run test to confirm it fails**

```bash
npm test -- --run src/components/cook/CountdownTimer.test.jsx
```

Expected: FAIL.

- [ ] **Step 12: Write `CountdownTimer` component**

```jsx
// recipe-box/src/components/cook/CountdownTimer.jsx
import { useState, useEffect, useRef } from 'react'

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

export default function CountdownTimer({ seconds: initialSeconds }) {
  const [remaining, setRemaining] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) { setRunning(false); return 0 }
          return r - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  function toggle() {
    if (remaining === 0) return
    setRunning(r => !r)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-sans font-medium border transition-colors ${
        running
          ? 'bg-terracotta text-white border-terracotta'
          : 'bg-cream-dark text-terracotta border-terracotta/50 hover:bg-terracotta/10'
      }`}
    >
      {running ? '⏸' : '⏱'} {formatTime(remaining)}
    </button>
  )
}
```

- [ ] **Step 13: Run test to confirm it passes**

```bash
npm test -- --run src/components/cook/CountdownTimer.test.jsx
```

Expected: 4 tests PASS.

- [ ] **Step 14: Write `CookStep` component**

```jsx
// recipe-box/src/components/cook/CookStep.jsx
import CountdownTimer from './CountdownTimer'

export default function CookStep({ step, index, total }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-sans text-stone-400">
        <span>Step {index + 1} of {total}</span>
        <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-terracotta/60 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>
      <p className="font-sans text-lg text-stone-800 leading-relaxed">{step.text}</p>
      {step.duration_seconds && step.duration_seconds > 0 && (
        <CountdownTimer seconds={step.duration_seconds} />
      )}
    </div>
  )
}
```

- [ ] **Step 15: Write `CookModePage`**

```jsx
// recipe-box/src/pages/CookModePage.jsx
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useRecipe } from '../hooks/useRecipes'
import { useCookSession } from '../hooks/useCookSession'
import { useWakeLock } from '../hooks/useWakeLock'
import { scaleIngredients } from '../utils/scaleIngredients'
import IngredientChecklist from '../components/cook/IngredientChecklist'
import CookStep from '../components/cook/CookStep'
import ServingScaler from '../components/recipe/ServingScaler'
import Spinner from '../components/ui/Spinner'

export default function CookModePage() {
  const { id } = useParams()
  const { data: recipe, isLoading, error } = useRecipe(id)
  const [servings, setServings] = useState(null)
  const [checklistOpen, setChecklistOpen] = useState(true)

  useWakeLock()

  const steps = recipe?.steps ?? []
  const { currentIndex, checkedIngredients, nextStep, prevStep, toggleIngredient } = useCookSession(steps)
  const currentServings = servings ?? recipe?.servings ?? 4
  const scaledIngredients = recipe
    ? scaleIngredients(recipe.ingredients ?? [], recipe.servings ?? currentServings, currentServings)
    : []

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (error) return <p className="p-8 text-red-600 font-sans">{error.message}</p>
  if (!recipe) return null

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to={`/recipe/${id}`} className="text-sm font-sans text-stone-400 hover:text-stone-200">← {recipe.title}</Link>
          <ServingScaler value={currentServings} onChange={setServings} />
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Ingredient checklist */}
          <div className="lg:col-span-2 mb-6 lg:mb-0">
            <button
              type="button"
              onClick={() => setChecklistOpen(o => !o)}
              className="flex items-center gap-2 font-serif text-lg mb-3 lg:pointer-events-none"
            >
              Ingredients
              <span className="lg:hidden text-stone-400 text-sm">{checklistOpen ? '▲' : '▼'}</span>
            </button>
            {(checklistOpen || window.innerWidth >= 1024) && (
              <IngredientChecklist
                ingredients={scaledIngredients}
                checked={checkedIngredients}
                onToggle={toggleIngredient}
              />
            )}
          </div>

          {/* Steps */}
          <div className="lg:col-span-3">
            {steps.length > 0 ? (
              <div className="bg-stone-800 rounded-2xl p-6 space-y-6">
                <CookStep step={steps[currentIndex]} index={currentIndex} total={steps.length} />
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentIndex === 0}
                    className="flex-1 py-3 rounded-xl border border-stone-600 text-stone-300 font-sans text-sm hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={currentIndex === steps.length - 1}
                    className="flex-1 py-3 rounded-xl bg-terracotta text-white font-sans text-sm hover:bg-terracotta-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-stone-400 font-sans text-sm">No steps found for this recipe.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 16: Verify cook mode in browser**

Navigate to any recipe → click "Start Cooking" → verify ingredient checklist, step navigation, progress bar, and timer on time-based steps.

- [ ] **Step 17: Commit**

```bash
cd "c:/Users/kwoka/OneDrive - PennO365/Desktop/ClaudeCodeTest"
git add recipe-box/
git commit -m "feat: add cook mode with ingredient checklist, step nav, timers, and Wake Lock"
```

---

## Task 7: Unit Converter

**Files:**
- Create: `src/utils/convertUnits.js`
- Create: `src/utils/convertUnits.test.js`
- Create: `src/components/ui/Drawer.jsx`
- Create: `src/components/recipe/UnitConverter.jsx`
- Modify: `src/pages/RecipeDetailPage.jsx`

- [ ] **Step 1: Write failing `convertUnits` tests**

```js
// recipe-box/src/utils/convertUnits.test.js
import { describe, it, expect } from 'vitest'
import { convert } from './convertUnits'

describe('convert', () => {
  it('converts ml to fl oz', () => {
    expect(convert(100, 'ml', 'floz')).toBeCloseTo(3.38, 1)
  })

  it('converts fl oz to ml', () => {
    expect(convert(1, 'floz', 'ml')).toBeCloseTo(29.57, 1)
  })

  it('converts Celsius to Fahrenheit', () => {
    expect(convert(100, 'C', 'F')).toBe(212)
  })

  it('converts Fahrenheit to Celsius', () => {
    expect(convert(32, 'F', 'C')).toBe(0)
  })

  it('converts tbsp to ml', () => {
    expect(convert(1, 'tbsp', 'ml')).toBeCloseTo(14.79, 1)
  })

  it('converts ml to tbsp', () => {
    expect(convert(14.79, 'ml', 'tbsp')).toBeCloseTo(1, 1)
  })

  it('converts g to cups using flour density', () => {
    expect(convert(125, 'g', 'cups', 'flour')).toBeCloseTo(1, 1)
  })

  it('converts cups to g using water density', () => {
    expect(convert(1, 'cups', 'g', 'water')).toBeCloseTo(237, 0)
  })

  it('returns null for unsupported conversion', () => {
    expect(convert(1, 'kg', 'miles')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- --run src/utils/convertUnits.test.js
```

Expected: FAIL.

- [ ] **Step 3: Write `convertUnits.js`**

```js
// recipe-box/src/utils/convertUnits.js

// Density in grams per cup for common ingredients
const DENSITY_G_PER_CUP = {
  flour:        125,
  'bread flour': 130,
  sugar:        200,
  'brown sugar': 220,
  'icing sugar': 120,
  butter:       227,
  water:        237,
  milk:         244,
  rice:         185,
  oats:          90,
  salt:         292,
  'cocoa powder': 85,
  honey:        340,
  'olive oil':  216,
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
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm test -- --run src/utils/convertUnits.test.js
```

Expected: 9 tests PASS.

- [ ] **Step 5: Write `Drawer` UI component**

```jsx
// recipe-box/src/components/ui/Drawer.jsx
import { useEffect } from 'react'

export default function Drawer({ open, onClose, title, children }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-serif text-xl">{title}</h2>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </>
  )
}
```

- [ ] **Step 6: Write `UnitConverter` component**

```jsx
// recipe-box/src/components/recipe/UnitConverter.jsx
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

const UNIT_LABELS = { g: 'g', cups: 'cups', ml: 'ml', floz: 'fl oz', C: '°C', F: '°F', tbsp: 'tbsp' }

export default function UnitConverter() {
  const [conversionIndex, setConversionIndex] = useState(0)
  const [input, setInput] = useState('')
  const [ingredient, setIngredient] = useState(getDensityOptions()[0])

  const conv = CONVERSIONS[conversionIndex]
  const result = input !== '' ? convert(Number(input), conv.from, conv.to, conv.needsIngredient ? ingredient : null) : null

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
            {formatQuantity(Math.round(result * 100) / 100)} <span className="text-base text-stone-600">{UNIT_LABELS[conv.to]}</span>
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Wire `UnitConverter` into `RecipeDetailPage`**

Add these imports to `src/pages/RecipeDetailPage.jsx`:

```jsx
import Drawer from '../components/ui/Drawer'
import UnitConverter from '../components/recipe/UnitConverter'
```

Replace the existing `{showConverter && ...}` placeholder (from Task 5) by adding a `Drawer` after the closing `</div>` of the main container:

```jsx
      <Drawer open={showConverter} onClose={() => setShowConverter(false)} title="Unit Converter">
        <UnitConverter />
      </Drawer>
    </div>  // closes min-h-screen div
  )
}
```

- [ ] **Step 8: Verify converter in browser**

Open a recipe detail page → click "Unit Converter" → drawer slides in → test g↔cups with flour, ml↔floz, °C↔°F.

- [ ] **Step 9: Commit**

```bash
cd "c:/Users/kwoka/OneDrive - PennO365/Desktop/ClaudeCodeTest"
git add recipe-box/
git commit -m "feat: add unit converter with density-aware g/cups and drawer UI"
```

---

## Task 8: "My Version" Photo Upload

**Files:**
- Modify: `src/pages/RecipeDetailPage.jsx`

- [ ] **Step 1: Add photo upload to `RecipeDetailPage`**

Add this import to `src/pages/RecipeDetailPage.jsx`:
```jsx
import { useRef } from 'react'
import { useAddMyVersionPhoto } from '../hooks/useRecipes'
```

Inside the component, add:
```jsx
const photoInputRef = useRef(null)
const addMyVersionPhoto = useAddMyVersionPhoto()

async function handlePhotoUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  await addMyVersionPhoto.mutateAsync({ recipeId: id, file })
}
```

Replace the existing "Add my photo" button area (in the flex row with the Start Cooking and Unit Converter buttons) with:

```jsx
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate(`/recipe/${id}/cook`)}>Start Cooking</Button>
          <Button variant="secondary" onClick={() => setShowConverter(v => !v)}>Unit Converter</Button>
          <Button
            variant="secondary"
            onClick={() => photoInputRef.current?.click()}
            disabled={addMyVersionPhoto.isPending}
          >
            {addMyVersionPhoto.isPending ? 'Uploading…' : '📷 Add my photo'}
          </Button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          {addMyVersionPhoto.isError && (
            <p className="w-full text-sm text-red-600 font-sans">{addMyVersionPhoto.error?.message}</p>
          )}
        </div>
```

- [ ] **Step 2: Verify photo upload in browser**

Open a recipe detail page → click "Add my photo" → select a photo → verify it uploads and the hero image updates to show the new photo. Reload — photo should persist. Return to home page — card thumbnail should now show the my-version photo.

- [ ] **Step 3: Run all tests**

```bash
cd "c:/Users/kwoka/OneDrive - PennO365/Desktop/ClaudeCodeTest/recipe-box"
npm test -- --run
```

Expected: all tests PASS. Count expected: 10 tests across formatQuantity (10), scaleIngredients (6), convertUnits (9), useCookSession (6), RecipeCard (3), ServingScaler (4), IngredientChecklist (3), CountdownTimer (4) = 45 tests.

- [ ] **Step 4: Push to GitHub**

```bash
cd "c:/Users/kwoka/OneDrive - PennO365/Desktop/ClaudeCodeTest"
git add recipe-box/
git commit -m "feat: add my-version photo upload to recipe detail"
git push origin main
```

---

## Self-Review Checklist

| Spec requirement | Covered in |
|---|---|
| Upload 1–3 images | Task 3 — ImageUploader |
| Claude Vision extraction | Task 2 — Edge Function; Task 3 — ExtractPage |
| Editable form before saving | Task 3 — RecipeForm |
| Save to Supabase | Task 2 — schema; Task 3 — useCreateRecipe |
| Card grid with thumbnail, title, cuisine, star | Task 4 — RecipeCard, HomePage |
| Search by name | Task 4 — HomePage client-side filter |
| Favourite/star | Task 4 — useToggleFavourite |
| My-version photo attached to recipe | Task 8 |
| Start Cooking button | Task 5 — RecipeDetailPage |
| Ingredient checkboxes with strikethrough | Task 6 — IngredientChecklist |
| Steps one at a time with Previous/Next | Task 6 — CookStep, CookModePage |
| Progress indicator | Task 6 — CookStep |
| Inline countdown timer | Task 6 — CountdownTimer, CookStep |
| Wake Lock API | Task 6 — useWakeLock |
| Serving scaler visible in both views | Task 5 — RecipeDetailPage; Task 6 — CookModePage |
| Ingredient quantity scaling | Task 5 — scaleIngredients |
| Fractional display | Task 5 — formatQuantity |
| Unit converter drawer | Task 7 — UnitConverter, Drawer |
| g↔cups density-aware | Task 7 — convertUnits |
| ml↔fl oz, °C↔°F, tbsp↔ml | Task 7 — convertUnits |
| Warm cookbook aesthetic | All pages — Tailwind config Task 1 |
| Env vars for Supabase, Anthropic key in secret | Task 1 (.env.local), Task 2 (Supabase secret) |
| frontend-design skill for polish | Invoke when building UI in each task |
