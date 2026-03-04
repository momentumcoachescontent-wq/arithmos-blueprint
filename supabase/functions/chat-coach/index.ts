import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, action, context } = await req.json();

    // Si la accion es resumir la sesión
    if (action === "summarize") {
      const summaryReq = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Eres el Coach de Arithmos. Resume la siguiente conversación del usuario en un párrafo conciso enfocado en la "Sombra" o patrón que se trabajó, y el aprendizaje u objetivo final establecido. Sé directo y analítico. No uses saludos.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 250,
      });

      return new Response(
        JSON.stringify({ summary: summaryReq.choices[0].message.content }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- MODO CHAT NORMAL ---
    // Construir el system prompt dinámico
    const profileContext = context ? `
Contexto del usuario:
- Nombre: ${context.name || "Usuario"}
- Camino de Vida: ${context.lifePath || "Desconocido"}
` : "";

    const systemMessage = {
      role: "system",
      content: `Eres el "Coach MADM" (Mente, Alma, Dios, Materia) dentro de la app Arithmos. 
Tu objetivo es tener "Conversaciones Honestas" con el usuario, operando bajo un tono de Psicología Aplicada, crecimiento post-traumático y confrontación compasiva. 
Eres provocativo pero sanador. Tu objetivo es romper patrones de miedo y transformar la oscuridad personal en poder.
No eres condescendiente ni usas positividad tóxica. Haces preguntas incisivas que invitan a la introspección.

Reglas:
1. Respuestas cortas, concisas y directas. Un párrafo máximo a menos que sea necesario.
2. Termina a menudo (pero no siempre) con una pregunta profunda.
3. No des sermones largos.
${profileContext}`
    };

    const chatMessages = [systemMessage, ...messages];

    // MODO STREAMING
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: chatMessages,
      temperature: 0.8,
      stream: true,
    });

    // Crear stream nativo de Deno/Web API
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error en chat-coach:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error processing request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
