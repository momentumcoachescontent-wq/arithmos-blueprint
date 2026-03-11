
import { createClient } from "jsr:@supabase/supabase-js@2";

export async function logTokenUsage(
  user_id: string | null,
  feature: string,
  model: string,
  prompt_tokens: number,
  completion_tokens: number
) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Costos estimados por cada 1,000,000 de tokens (OpenAI rates approx)
  const rates: Record<string, { prompt: number; completion: number }> = {
    "gpt-4o": { prompt: 5.0, completion: 15.0 },
    "gpt-4o-mini": { prompt: 0.15, completion: 0.60 },
    "gpt-4-turbo": { prompt: 10.0, completion: 30.0 },
    "default": { prompt: 10.0, completion: 30.0 }
  };

  const currentRate = rates[model] || rates["default"];
  const estimated_cost = (
    (prompt_tokens / 1000000) * currentRate.prompt +
    (completion_tokens / 1000000) * currentRate.completion
  );

  try {
    const { error } = await supabase
      .from("ai_token_usage")
      .insert({
        user_id,
        feature,
        model_id: model,
        prompt_tokens,
        completion_tokens,
        estimated_cost_usd: estimated_cost
      });

    if (error) console.error("Error logging token usage:", error.message);
  } catch (err) {
    console.error("Token Tracker Failed:", err);
  }
}
