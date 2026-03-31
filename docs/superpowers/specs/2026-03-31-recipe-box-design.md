# My Recipe Box — Design Spec

**Date:** 2026-03-31
**Status:** Approved

---

## Overview

A personal recipe collection web app. Users upload screenshots from Instagram or phone photos; Claude Vision extracts and formats the recipe automatically. Recipes are saved to Supabase and browsable across devices. Includes cook mode, serving scaler, and unit converter.

Single-user, no authentication required.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Routing | React Router v6 |
| Data fetching | TanStack Query v5 |
| Backend / DB | Supabase (Postgres + Storage + Edge Functions) |
| AI extraction | Anthropic API (`claude-sonnet-4-20250514`) via Supabase Edge Function |
| Environment | `.env.local` — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`; `ANTHROPIC_API_KEY` stored as a Supabase secret (never in browser) |

---

## Design Aesthetic

Warm and cozy cookbook feel.

- **Backgrounds:** cream / off-white (`#FAF7F2`, `#F5F0E8`)
- **Accents:** terracotta (`#C4622D`) and sage green (`#7A9E7E`)
- **Typography:** serif font (e.g. Playfair Display or Lora) for headings; clean sans-serif (Inter) for body
- **Feel:** generous whitespace, soft shadows, rounded cards — like a well-loved physical cookbook translated to screen
- **Frontend-design skill** will be invoked during implementation for visual polish

---

## Project Structure

```
recipe-box/
├── src/
│   ├── components/
│   │   ├── ui/             # Button, Input, Badge, Modal, Spinner, Drawer
│   │   ├── recipe/         # RecipeCard, RecipeForm, ServingScaler, UnitConverter
│   │   └── cook/           # CookStep, IngredientChecklist, CountdownTimer
│   ├── pages/
│   │   ├── HomePage.jsx         # Recipe grid + search + favourites filter
│   │   ├── ExtractPage.jsx      # Upload → extract → edit form → save
│   │   ├── RecipeDetailPage.jsx # Full recipe view
│   │   └── CookModePage.jsx     # Cook mode
│   ├── hooks/
│   │   ├── useRecipes.js        # TanStack Query wrappers for Supabase
│   │   ├── useCookSession.js    # Local cook session state
│   │   └── useWakeLock.js       # Wake Lock API
│   ├── lib/
│   │   ├── supabase.js          # Supabase client
│   │   └── queryClient.js       # TanStack Query client
│   └── App.jsx
├── supabase/
│   └── functions/
│       └── extract-recipe/      # Deno edge function → Anthropic API
├── .env.local
└── vite.config.js
```

---

## Routes

| Path | Page | Purpose |
|---|---|---|
| `/` | HomePage | Recipe grid, search, favourites toggle, FAB |
| `/extract` | ExtractPage | Upload images → Claude → editable form → save |
| `/recipe/:id` | RecipeDetailPage | Full recipe, scaler, unit converter, cook button |
| `/recipe/:id/cook` | CookModePage | Step-by-step cook mode with timers and checklist |

---

## Data Model

### `recipes` table

```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
title        text NOT NULL
cuisine_tag  text
servings     integer
prep_time    text              -- e.g. "15 mins"
cook_time    text              -- e.g. "30 mins"
ingredients  jsonb             -- [{quantity: 1.5, unit: "cups", name: "flour", notes: "sifted"}]
steps        jsonb             -- [{order: 1, text: "...", duration_seconds: 600}]
tips         text
is_favourite boolean DEFAULT false
created_at   timestamptz DEFAULT now()
```

### `recipe_images` table

```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
recipe_id     uuid REFERENCES recipes(id) ON DELETE CASCADE
storage_path  text              -- path in Supabase Storage
image_type    text              -- 'source' | 'my_version'
created_at    timestamptz DEFAULT now()
```

### Supabase Storage

- **Bucket:** `recipe-images` (public)
- Source screenshots: `source/{recipe_id}/{filename}`
- "My version" photos: `my-version/{recipe_id}/{filename}`

---

## Edge Function: `extract-recipe`

**Location:** `supabase/functions/extract-recipe/index.ts`

**Input:**
```json
{ "images": ["data:image/jpeg;base64,..."] }
```
1–3 base64 data URLs.

**Process:**
1. Receives images from the browser
2. Calls `claude-sonnet-4-20250514` with a system prompt instructing structured JSON extraction
3. Extracts: `title`, `servings`, `prep_time`, `cook_time`, `ingredients` (array), `steps` (array with optional `duration_seconds`), `tips`
4. Returns the parsed JSON to the browser

**Output:**
```json
{
  "title": "Pasta al Limone",
  "servings": 4,
  "prep_time": "10 mins",
  "cook_time": "20 mins",
  "ingredients": [
    { "quantity": 400, "unit": "g", "name": "spaghetti", "notes": "" }
  ],
  "steps": [
    { "order": 1, "text": "Boil salted water. Cook pasta for 10 minutes.", "duration_seconds": 600 }
  ],
  "tips": "Use fresh lemon zest for best flavour."
}
```

The Edge Function is also responsible for detecting durations within step text (e.g. "simmer for 10 minutes") and populating `duration_seconds` accordingly. The frontend treats this as a read-only extracted value.

The `ANTHROPIC_API_KEY` is stored as a Supabase secret and never sent to the browser.

---

## Feature Design

### Recipe Extraction (ExtractPage)

- Drag-and-drop or click-to-upload zone; accepts 1–3 images (JPEG/PNG/WEBP, max 10MB each)
- Images previewed as thumbnails before submitting
- On submit: images converted to base64 → POSTed to the `extract-recipe` Edge Function
- Loading state: spinner with "Extracting recipe with Claude…"
- Result populates a `RecipeForm` with all fields editable
- Save: inserts recipe row to Supabase, uploads source images to Storage, navigates to `/recipe/:id`

### Collection & Browse (HomePage)

- Responsive card grid: 2 cols mobile, 3–4 cols desktop
- `RecipeCard` shows: thumbnail (my-version photo if present, else source screenshot), title, cuisine tag badge, star/favourite button
- Search bar: client-side filter on title against TanStack Query cache (no extra DB call)
- Favourites toggle: filters grid to `is_favourite = true` recipes only
- FAB ("+ Add Recipe") in bottom-right corner → navigates to `/extract`

### Recipe Detail (RecipeDetailPage)

- Header: hero image (my-version if present, else source screenshot), title, cuisine tag, prep/cook time, serving scaler
- Ingredients list with scaled quantities
- Numbered steps
- Tips section
- Unit Converter drawer trigger button
- "Add my photo" button
- "Start Cooking" button → navigates to `/recipe/:id/cook`

### Cook Mode (CookModePage)

- Wake Lock: `navigator.wakeLock.request('screen')` on mount, released on unmount
- Layout (desktop): ingredient checklist on left, steps on right
- Layout (mobile): ingredient checklist collapsed/expandable at top, steps below
- **Ingredient checklist:** tapping an ingredient toggles strikethrough; state is local to the session (not persisted)
- **Step navigation:** one step at a time, large readable text; Previous / Next Step buttons; progress indicator ("Step 2 of 7")
- **Inline timers:** steps containing a duration (regex: `\d+\s*(min|sec|hour)s?`) show a tappable timer chip; tap to start countdown displaying MM:SS; tap again to pause
- Serving scaler remains visible and functional in cook mode

### Serving Scaler

- Pill selector (2 / 4 / 6 / 8) or +/− stepper, visible on RecipeDetailPage and CookModePage
- `baseServings` and `baseIngredients` are the original saved values
- `scaleFactor = currentServings / baseServings`
- All quantities re-rendered as `baseQty * scaleFactor`, rounded to 2 decimal places
- Fractional display: 0.25 → ¼, 0.5 → ½, 0.75 → ¾ where clean

### Unit Converter

- Slide-in drawer panel, accessible from RecipeDetailPage
- Supported conversions:
  - g ↔ cups (density-aware via ingredient dropdown)
  - ml ↔ fl oz
  - °C ↔ °F
  - tbsp ↔ ml
- Ingredient-type dropdown for g↔cups: hardcoded density lookup (flour, sugar, butter, water, milk, rice, oats, etc.)
- Stateless — no persistence needed

### "My Version" Photo

- "Add my photo" button on RecipeDetailPage opens file picker
- Uploads to `my-version/{recipe_id}/{filename}` in Supabase Storage
- Inserts a `recipe_images` row with `image_type = 'my_version'`
- Displayed as hero image on RecipeDetailPage and as card thumbnail on HomePage if present; falls back to source screenshot otherwise

---

## Build Order

1. Project scaffold + Supabase client + TanStack Query setup + env config
2. Supabase schema (migrations) + Edge Function scaffold
3. Recipe extraction flow: upload → Edge Function → editable form → save
4. Collection browse: HomePage grid, RecipeCard, search, favourites
5. Recipe detail page + serving scaler
6. Cook mode: checklist, step navigation, countdown timers, Wake Lock
7. Unit converter drawer
8. "My version" photo upload

---

## Error Handling

- Edge Function errors (Anthropic timeout, bad response): display inline error on ExtractPage with retry button
- Image upload failures: toast notification, file not saved
- Supabase query errors: TanStack Query surfaces these; display inline error states per page
- Wake Lock unavailable (some browsers/contexts): silently degrade — no crash, no user-facing error

---

## Out of Scope

- User authentication / multi-user support
- Recipe sharing or export
- Offline mode / service worker
- Nutrition information
- Shopping list generation
