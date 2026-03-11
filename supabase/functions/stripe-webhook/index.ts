// @ts-nocheck
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-04-10",
});

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

Deno.serve(async (req: Request) => {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
        event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET);
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log(`Processing event: ${event.type}`);

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.supabase_user_id;

            // Actualizar el intento de pago a "completed"
            await supabase
                .from("payment_intents")
                .update({ status: "completed" })
                .eq("checkout_session_id", session.id);

            if (userId && session.mode === "subscription") {
                // Activar plan Premium en Supabase
                await supabase
                    .from("profiles")
                    .update({
                        role: "premium",
                        stripe_subscription_id: session.subscription as string,
                        subscription_status: "active",
                    })
                    .eq("user_id", userId);
                console.log(`✅ Premium activated for user: ${userId}`);
            }
            break;
        }

        case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = subscription.metadata?.supabase_user_id;
            if (userId) {
                const isActive = subscription.status === "active" || subscription.status === "trialing";
                await supabase
                    .from("profiles")
                    .update({
                        role: isActive ? "premium" : "freemium",
                        subscription_status: subscription.status,
                    })
                    .eq("user_id", userId);
                console.log(`🔄 Subscription updated for user ${userId}: ${subscription.status}`);
            }
            break;
        }

        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = subscription.metadata?.supabase_user_id;
            if (userId) {
                // Degradar a plan gratuito
                await supabase
                    .from("profiles")
                    .update({
                        role: "freemium",
                        subscription_status: "cancelled",
                        stripe_subscription_id: null,
                    })
                    .eq("user_id", userId);
                console.log(`❌ Subscription cancelled for user: ${userId}`);
            }
            break;
        }

        case "checkout.session.expired":
        case "checkout.session.async_payment_failed": {
            // Un intento se cerró por timeout o falló el pago asíncrono
            const session = event.data.object as Stripe.Checkout.Session;
            await supabase
                .from("payment_intents")
                .update({ status: "failed" })
                .eq("checkout_session_id", session.id);
            console.log(`⚠️ Payment session failed/expired: ${session.id}`);
            break;
        }

        case "invoice.payment_succeeded": {
            const invoice = event.data.object as Stripe.Invoice;
            if (invoice.customer) {
                // Asegurar que el usuario vuelva a premium si el pago recurrente fue exitoso
                const { data: profile } = await supabase
                    .from("profiles")
                    .update({ 
                        role: "premium",
                        subscription_status: "active" 
                    })
                    .eq("stripe_customer_id", invoice.customer as string)
                    .select("user_id")
                    .single();
                
                if (profile) {
                    console.log(`✅ Recursive payment succeeded for user: ${profile.user_id}`);
                }
            }
            break;
        }

        case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;

            // Si el pago falla (recurrente o inicial), marcamos como past_due
            if (invoice.customer) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .update({ subscription_status: "past_due" })
                    .eq("stripe_customer_id", invoice.customer as string)
                    .select("user_id")
                    .single();
                
                if (profile) {
                    console.log(`⚠️ Payment failed for customer: ${invoice.customer} (User: ${profile.user_id})`);
                }
            }
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
});
