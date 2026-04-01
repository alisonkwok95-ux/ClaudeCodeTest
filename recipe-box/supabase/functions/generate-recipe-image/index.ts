import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { recipeId, title, cuisine_tag, ingredients } = await req.json()

    if (!recipeId || !title) {
      return new Response(
        JSON.stringify({ error: "recipeId and title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Build a descriptive prompt
    const cuisineDesc = cuisine_tag ? `${cuisine_tag} cuisine, ` : ""
    const ingredientNames = (ingredients ?? []).slice(0, 4).map((i: { name: string }) => i.name).join(", ")
    const ingredientDesc = ingredientNames ? ` featuring ${ingredientNames}` : ""
    const prompt = `Professional food photography of ${title}, ${cuisineDesc}served on a plate${ingredientDesc}, warm natural lighting, shallow depth of field, cookbook style, appetizing`

    // Call OpenAI Images API
    const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.json()
      throw new Error(err.error?.message ?? "OpenAI request failed")
    }

    const openaiData = await openaiRes.json()
    const imageUrl = openaiData.data[0].url

    // Download the generated image
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) throw new Error("Failed to download generated image")
    const imgBuffer = await imgRes.arrayBuffer()

    // Upload to Supabase Storage
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const storagePath = `generated/${recipeId}/hero.jpg`
    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(storagePath, imgBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      })
    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

    // Insert recipe_images row
    const { error: dbError } = await supabase
      .from("recipe_images")
      .insert({ recipe_id: recipeId, storage_path: storagePath, image_type: "generated" })
    if (dbError) throw new Error(`DB insert failed: ${dbError.message}`)

    return new Response(JSON.stringify({ storage_path: storagePath }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : ""
    return new Response(
      JSON.stringify({ error: message, stack }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
