import { createClient } from "jsr:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";
import OpenAI from "openai";
import { getSafeCorsHeaders } from "../_shared/cors.ts";
import { sanitizePromptInput } from "../_shared/sanitize.ts";
import { logTokenUsage } from "../_shared/token-tracker.ts";
import { buildCoachSystemPrompt, buildSummarizePrompt, type CoachContext } from "../_shared/prompts.ts";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

const FALLBACK_CHAT_MODEL = "claude-sonnet-4-6";
const FALLBACK_SUMMARIZE_MODEL = "claude-haiku-4-5-20251001";

function isOpenAIModel(model: string): boolean {
  return model.startsWith("gpt-") || model.startsWith("o1") || model.startsWith("o3");
}

async function getModelConfig(feature: string, fallback: string): Promise<string> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data } = await supabase
      .from("system_prompts")
      .select("model_id")
      .eq("feature", feature)
      .single();
    return data?.model_id || fallback;
  } catch {
    return fallback;
  }
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getSafeCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const bodyText = await req.text();
    let body: {
      messages?: Array<{ role: string; content: string }>;
      action?: string;
      context?: Partial<CoachContext>;
    };
    try {
      body = JSON.parse(bodyText);
    } catch (_e) {
      throw new Error("Invalid JSON body");
    }

    const { messages = [], action = "chat", context = {} } = body;

    // --- AUTH & USER_ID ---
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) userId = user.id;
      } catch (e) {
        console.warn("No se pudo extraer userId:", (e as Error).message);
      }
    }

    const cleanMessages = (Array.isArray(messages) ? messages : [])
      .filter((m) => (m.role === "user" || m.role === "assistant") && m.content?.trim())
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    // --- SUMMARIZE ---
    if (action === "summarize") {
      const model = await getModelConfig("coach_summarize", FALLBACK_SUMMARIZE_MODEL);
      const conversationText = (Array.isArray(messages) ? messages : [])
        .map((m) => `${m.role === "user" ? "Usuario" : "Coach"}: ${m.content}`)
        .join("\n\n");

      let summary = "";
      let inputTokens = 0;
      let outputTokens = 0;

      if (isOpenAIModel(model)) {
        const res = await openai.chat.completions.create({
          model,
          max_tokens: 300,
          messages: [
            { role: "system", content: buildSummarizePrompt() },
            { role: "user", content: conversationText },
          ],
        });
        summary = res.choices[0]?.message?.content || "";
        inputTokens = res.usage?.prompt_tokens || 0;
        outputTokens = res.usage?.completion_tokens || 0;
      } else {
        const res = await anthropic.messages.create({
          model,
          max_tokens: 300,
          system: buildSummarizePrompt(),
          messages: [{ role: "user", content: conversationText }],
        });
        const block = res.content[0];
        summary = block.type === "text" ? block.text : "";
        inputTokens = res.usage.input_tokens;
        outputTokens = res.usage.output_tokens;
      }

      await logTokenUsage(userId, "coach_summarize", model, inputTokens, outputTokens);
      return new Response(
        JSON.stringify({ summary }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- CHAT (STREAMING) ---
    if (cleanMessages.length === 0 || cleanMessages[cleanMessages.length - 1].role !== "user") {
      return new Response(
        JSON.stringify({ error: "No valid messages to process" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const model = await getModelConfig("coach_chat", FALLBACK_CHAT_MODEL);
    const safeContext: CoachContext = {
      name: sanitizePromptInput(context.name || "Usuario"),
      lifePathNumber: typeof context.lifePathNumber === "number" ? context.lifePathNumber : 1,
      archetype: context.archetype || "El Pionero",
      archetypePowers: Array.isArray(context.archetypePowers) ? context.archetypePowers : [],
      archetypeShadow: context.archetypeShadow || "",
      archetypeCoachingNote: context.archetypeCoachingNote || "",
    };
    const systemPrompt = buildCoachSystemPrompt(safeContext);
    const encoder = new TextEncoder();

    if (isOpenAIModel(model)) {
      // OpenAI streaming
      const stream = await openai.chat.completions.create({
        model,
        max_tokens: 1024,
        stream: true,
        stream_options: { include_usage: true },
        messages: [
          { role: "system", content: systemPrompt },
          ...cleanMessages,
        ],
      });

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) controller.enqueue(encoder.encode(content));
              if (chunk.usage) {
                await logTokenUsage(
                  userId, "coach_chat_stream", model,
                  chunk.usage.prompt_tokens, chunk.usage.completion_tokens,
                );
              }
            }
            controller.close();
          } catch (err) {
            console.error("OpenAI stream error:", err);
            controller.error(err);
          }
        },
      });

      return new Response(readableStream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
      });
    } else {
      // Anthropic streaming
      const claudeStream = anthropic.messages.stream({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: cleanMessages,
      });

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            claudeStream.on("text", (text) => controller.enqueue(encoder.encode(text)));
            const finalMsg = await claudeStream.finalMessage();
            await logTokenUsage(
              userId, "coach_chat_stream", model,
              finalMsg.usage.input_tokens, finalMsg.usage.output_tokens,
            );
            controller.close();
          } catch (err) {
            console.error("Anthropic stream error:", err);
            controller.error(err);
          }
        },
      });

      return new Response(readableStream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
      });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error processing request";
    console.error("Error en chat-coach:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
