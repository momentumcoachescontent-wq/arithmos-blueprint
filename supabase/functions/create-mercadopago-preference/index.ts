import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "https://app.arithmos.mx",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const { userId, successUrl, failureUrl } = await req.json();

        if (!userId) {
            return new Response(JSON.stringify({ error: "userId is required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // TODO: Implementar MercadoPago SDK
        // 1. Inicializar MP con Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")
        // 2. Crear una preference
        // 3. Devolver preference.init_point o preference.sandbox_init_point

        // Placeholder Response
        return new Response(JSON.stringify({
            message: "MercadoPago endpoint reached. Awaiting MP Token.",
            init_point: "https://sandbox.mercadopago.com.mx/checkout/123-abc"
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error creating MP preference:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
