import { createClient } from "jsr:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";
import { getSafeCorsHeaders } from "../_shared/cors.ts";
import { sanitizePromptInput } from "../_shared/sanitize.ts";
import { logTokenUsage } from "../_shared/token-tracker.ts";
import { buildCoachSystemPrompt, buildSummarizePrompt, type CoachContext } from "../_shared/prompts.ts";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

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
      console.error("No se pudo parsear JSON:", bodyText);
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
        console.warn("No se pudo extraer userId del token:", (e as Error).message);
      }
    }

    // --- SUMMARIZE ---
    if (action === "summarize") {
      const conversationText = (Array.isArray(messages) ? messages : [])
        .map((m) => `${m.role === "user" ? "Usuario" : "Coach"}: ${m.content}`)
        .join("\n\n");

      const summaryReq = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: buildSummarizePrompt(),
        messages: [{ role: "user", content: conversationText }],
      });

      await logTokenUsage(
        userId,
        "coach_summarize",
        "claude-haiku-4-5-20251001",
        summaryReq.usage.input_tokens,
        summaryReq.usage.output_tokens,
      );

      const block = summaryReq.content[0];
      const summary = block.type === "text" ? block.text : "";

      return new Response(
        JSON.stringify({ summary }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- CHAT (STREAMING) ---
    const safeContext: CoachContext = {
      name: sanitizePromptInput(context.name || "Usuario"),
      lifePathNumber: typeof context.lifePathNumber === "number" ? context.lifePathNumber : 1,
      archetype: context.archetype || "El Pionero",
      archetypePowers: Array.isArray(context.archetypePowers) ? context.archetypePowers : [],
      archetypeShadow: context.archetypeShadow || "",
      archetypeCoachingNote: context.archetypeCoachingNote || "",
    };

    const chatMessages = (Array.isArray(messages) ? messages : []) as Array<{
      role: "user" | "assistant";
      content: string;
    }>;

    const claudeStream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: buildCoachSystemPrompt(safeContext),
      messages: chatMessages,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          claudeStream.on("text", (text) => {
            controller.enqueue(encoder.encode(text));
          });

          const finalMsg = await claudeStream.finalMessage();
          await logTokenUsage(
            userId,
            "coach_chat_stream",
            "claude-sonnet-4-6",
            finalMsg.usage.input_tokens,
            finalMsg.usage.output_tokens,
          );

          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error processing request";
    console.error("Error en chat-coach:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
