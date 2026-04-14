import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) throw new Error("Missing targetUserId");

    // 1. Verificar si ya existe el like
    const { data: existing } = await supabaseClient
      .from("cosmic_interactions")
      .select("*")
      .eq("sender_id", user.id)
      .eq("receiver_id", targetUserId)
      .single();

    if (existing) {
      return new Response(JSON.stringify({ message: "Vibe already sent", match: existing.is_mutual }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 2. Verificar si hay un Match (si el target ya me dio like)
    const { data: targetLikedMe } = await supabaseClient
      .from("cosmic_interactions")
      .select("*")
      .eq("sender_id", targetUserId)
      .eq("receiver_id", user.id)
      .single();

    const isMatch = !!targetLikedMe;

    // 3. Insertar el Like
    const { error: insertError } = await supabaseClient
      .from("cosmic_interactions")
      .insert({
        sender_id: user.id,
        receiver_id: targetUserId,
        is_mutual: isMatch,
      });

    if (insertError) throw insertError;

    // 4. Si es match, actualizar la otra entrada
    if (isMatch) {
      await supabaseClient
        .from("cosmic_interactions")
        .update({ is_mutual: true })
        .eq("sender_id", targetUserId)
        .eq("receiver_id", user.id);

      // Notificaciones de MATCH para AMBOS
      await supabaseClient.from("notifications").insert([
        {
          user_id: user.id,
          type: "cosmic_match",
          channel: "push",
          title: "¡It's a Cosmic Match! 💞",
          body: "Tus astros se han alineado con un nuevo alma en el radar.",
        },
        {
          user_id: targetUserId,
          type: "cosmic_match",
          channel: "push",
          title: "¡Alineación Detectada! 💞",
          body: "Alguien especial ha correspondido tu vibración cósmica.",
        }
      ]);
    } else {
      // Notificación de LIKE para el receptor
      await supabaseClient.from("notifications").insert({
        user_id: targetUserId,
        type: "vibe_like",
        channel: "push",
        title: "Vibración Detectada ✨",
        body: "Alguien ha sentido afinidad con tu perfil en el radar.",
      });
    }

    return new Response(JSON.stringify({ success: true, match: isMatch }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
