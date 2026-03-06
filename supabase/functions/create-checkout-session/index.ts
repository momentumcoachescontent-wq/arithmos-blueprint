import Stripe from "npm:stripe@14";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getSafeCorsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-04-10",
});

Deno.serve(async (req) => {
    const corsHeaders = getSafeCorsHeaders(req);
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
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("email, name, stripe_customer_id")
            .eq("user_id", userId)
            .single();

        if (profileError) {
            console.error("Profile fetch error:", profileError);
            // Non-fatal, we continue but email might be missing
        }

        let customerId = profile?.stripe_customer_id;

        // Crear o reutilizar el cliente de Stripe
        if (!customerId) {
            console.log("Creating new Stripe customer for user:", userId);
            try {
                const customer = await stripe.customers.create({
                    email: profile?.email || undefined,
                    name: profile?.name || undefined,
                    metadata: { supabase_user_id: userId },
                });
                customerId = customer.id;

                // Guardar el stripe_customer_id en el perfil
                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({ stripe_customer_id: customerId })
                    .eq("user_id", userId);

                if (updateError) console.error("Error updating profile with customerId:", updateError);
            } catch (err: any) {
                console.error("Stripe customer creation failed:", err);
                throw new Error(`Failed to create Stripe customer: ${err.message}`);
            }
        }

        console.log("Creating checkout session for customer:", customerId, "Price:", priceId);

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
        try {
            const { error: intentError } = await supabase.from("payment_intents").insert({
                user_id: userId,
                provider: "stripe",
                status: "pending",
                checkout_session_id: session.id,
                amount: 9.99, // Podríamos intentar obtener el precio real de Stripe aquí si fuera necesario
                currency: "usd"
            });
            if (intentError) console.error("Error tracking payment intent:", intentError);
        } catch (e) {
            console.error("Payment intent track failed (ignoring):", e);
        }

        return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
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
