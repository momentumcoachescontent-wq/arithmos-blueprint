import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
    const url = new URL(req.url);
    const action = url.searchParams.get("data.id") || await req.json().then(b => b.data?.id).catch(() => null);

    if (!action) {
        return new Response(JSON.stringify({ error: "No action ID provided" }), { status: 400 });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log(`Processing MP Webhook for payment ID: ${action}`);

    // TODO: Implementar MercadoPago SDK
    // 1. Validar la firma / webhook secret via Headers o consultar estado del pago al API
    // 2. Si es 'approved', actualizar profile -> role = 'premium'
    // 3. Si es rechazado o cancelado, revertir o notificar

    return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
});
