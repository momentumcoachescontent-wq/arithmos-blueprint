import Stripe from "npm:stripe@14";
import { createClient } from "jsr:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-04-10",
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
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

        const { priceId, userId, successUrl, cancelUrl } = await req.json();

        if (!priceId || !userId) {
            return new Response(JSON.stringify({ error: "priceId and userId are required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Obtener datos del perfil del usuario
        const { data: profile } = await supabase
            .from("profiles")
            .select("email, name, stripe_customer_id")
            .eq("user_id", userId)
            .single();

        let customerId = profile?.stripe_customer_id;

        // Crear o reutilizar el cliente de Stripe
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: profile?.email || undefined,
                name: profile?.name || undefined,
                metadata: { supabase_user_id: userId },
            });
            customerId = customer.id;

            // Guardar el stripe_customer_id en el perfil
            await supabase
                .from("profiles")
                .update({ stripe_customer_id: customerId })
                .eq("user_id", userId);
        }

        // Crear la sesión de checkout
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: { supabase_user_id: userId },
            subscription_data: {
                metadata: { supabase_user_id: userId },
            },
        });

        // Trackear el intento en la Base de Datos (Módulo FinOps - Carritos Abandonados)
        await supabase.from("payment_intents").insert({
            user_id: userId,
            provider: "stripe",
            status: "pending",
            checkout_session_id: session.id,
            amount: 9.99, // Hardcoded por ahora basado en el roadmap
            currency: "usd"
        });

        return new Response(JSON.stringify({ sessionId: session.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error creating checkout session:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
