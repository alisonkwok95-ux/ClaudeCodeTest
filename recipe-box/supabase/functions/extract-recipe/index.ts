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
