import { getSafeCorsHeaders } from "../_shared/cors.ts";
import { calculateLifePath, calculateNameValue, reduceToSingleDigitOrMaster } from "../_shared/numerology.ts";
import { ARCHETYPES } from "../_shared/archetypes.ts";

Deno.serve(async (req: Request) => {
  const corsHeaders = getSafeCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { name, birthDate } = body as { name?: string; birthDate?: string };

    if (!name || typeof name !== "string" || name.trim() === "") {
      return new Response(
        JSON.stringify({ error: "name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!birthDate || typeof birthDate !== "string") {
      return new Response(
        JSON.stringify({ error: "birthDate is required (YYYY-MM-DD)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const lifePathNumber = calculateLifePath(birthDate);
    const expressionNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, "all"));
    const soulUrgeNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, "vowels"));
    const personalityNumber = reduceToSingleDigitOrMaster(calculateNameValue(name, "consonants"));

    const archetypeEntry = ARCHETYPES[lifePathNumber] ?? ARCHETYPES[1];

    return new Response(
      JSON.stringify({
        lifePathNumber,
        expressionNumber,
        soulUrgeNumber,
        personalityNumber,
        archetype: archetypeEntry.name,
        archetypeDescription: archetypeEntry.description,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error("Error in calculate-blueprint:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
