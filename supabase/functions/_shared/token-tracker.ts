
import { createClient } from "jsr:@supabase/supabase-js@2";

export async function logTokenUsage(
  user_id: string | null,
  feature: string,
  model: string,
  prompt_tokens: number,
  completion_tokens: number
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    console.error("Token Tracker: Missing Supabase environment variables.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Costos estimados por cada 1,000,000 de tokens (OpenAI rates approx)
  const rates: Record<string, { prompt: number; completion: number }> = {
    "gpt-4o": { prompt: 5.0, completion: 15.0 },
    "gpt-4o-mini": { prompt: 0.15, completion: 0.60 },
    "gpt-4-turbo": { prompt: 10.0, completion: 30.0 },
    "claude-sonnet-4-6": { prompt: 3.0, completion: 15.0 },
    "claude-haiku-4-5-20251001": { prompt: 0.80, completion: 4.0 },
    "default": { prompt: 10.0, completion: 30.0 }
  };

  const currentRate = rates[model] || rates["default"];
  const estimated_cost = (
    (prompt_tokens / 1000000) * currentRate.prompt +
    (completion_tokens / 1000000) * currentRate.completion
  );

  console.log(`[TokenTracker] Logging ${feature} (${model}): ${prompt_tokens + completion_tokens} tokens. Cost: $${estimated_cost.toFixed(6)}`);

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

    if (error) {
        console.error("Token Tracker DB Error:", error.message);
        // Intentar insertar sin user_id si hubo error de FK
        if (user_id && error.message.includes("foreign key")) {
             console.log("[TokenTracker] Retrying without user_id due to FK error...");
             await supabase.from("ai_token_usage").insert({
                user_id: null,
                feature,
                model_id: model,
                prompt_tokens,
                completion_tokens,
                estimated_cost_usd: estimated_cost
             });
        }
    } else {
        console.log("✅ Token usage logged successfully.");
    }
  } catch (err) {
    console.error("Token Tracker Exception:", err);
  }
}
