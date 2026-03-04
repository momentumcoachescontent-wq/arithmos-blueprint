import Stripe from "npm:stripe@14";
import { createClient } from "jsr:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-04-10",
});

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

Deno.serve(async (req) => {
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

        case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            // Marcar la suscripción como en riesgo (sin degradar todavía)
            if (invoice.customer) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("user_id")
                    .eq("stripe_customer_id", invoice.customer as string)
                    .single();
                if (profile) {
                    await supabase
                        .from("profiles")
                        .update({ subscription_status: "past_due" })
                        .eq("user_id", profile.user_id);
                    console.log(`⚠️ Payment failed for customer: ${invoice.customer}`);
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
