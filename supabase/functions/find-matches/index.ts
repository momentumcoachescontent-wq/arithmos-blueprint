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

    // Lógica para encontrar matches:
    // 1. Obtener los perfiles (limitado a 20)
    // 2. Que sean públicos
    // 3. Que NO sean el usuario actual
    const { data: profiles, error } = await supabaseClient
      .from("profiles")
      .select("user_id, name, bio, life_path_number, sun_sign, moon_sign, rising_sign, birth_date")
      .eq("is_public", true)
      .neq("user_id", user.id)
      .limit(30);

    if (error) {
      throw error;
    }

    // Simplificamos shuffle para MVP (randomizar el resultado limitándolo)
    const shuffled = (profiles || []).sort(() => 0.5 - Math.random()).slice(0, 15);

    return new Response(JSON.stringify({ matches: shuffled }), {
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
