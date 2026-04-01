import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
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
      const cleanRecipe = {
        ...recipe,
        ingredients: (recipe.ingredients ?? []).map(({ _key, ...rest }) => rest),
        steps: (recipe.steps ?? []).map(({ _key, ...rest }) => rest),
      }
      const { data, error } = await supabase
        .from('recipes')
        .insert(cleanRecipe)
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

      // Fire-and-forget DALL-E image generation (non-blocking)
      supabase.functions.invoke('generate-recipe-image', {
        body: {
          recipeId: data.id,
          title: data.title,
          cuisine_tag: data.cuisine_tag,
          ingredients: data.ingredients,
        },
      })

      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  })
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('recipes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      navigate('/')
    },
  })
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, recipe }) => {
      const { recipe_images, id: _id, created_at, ...rest } = recipe
      const clean = {
        ...rest,
        ingredients: (rest.ingredients ?? []).map(({ _key, ...r }) => r),
        steps: (rest.steps ?? []).map(({ _key, ...r }) => r),
      }
      const { data, error } = await supabase.from('recipes').update(clean).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', data.id] })
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
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
