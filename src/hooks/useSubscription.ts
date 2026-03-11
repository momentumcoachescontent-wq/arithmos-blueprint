import { useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useAppConfig } from "./useAppConfig";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_live_51LDzMqGdhRtIc6ULYspd91Q7x6Ys26s4si31edRIPLHe9UwDtcifvx9XaD0Pkp5xuIJxJZZjKUFcq5xWL04PVFcH0004oH7hHf";

export type SubscriptionStatus = "free" | "premium" | "admin" | "loading";

export function useSubscription(userId?: string) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { config } = useAppConfig();

    /**
     * Redirige al usuario al checkout de Stripe para el plan Premium.
     * Requiere: VITE_STRIPE_PUBLIC_KEY y VITE_STRIPE_PRICE_ID en .env (o config de DB)
     */
    const redirectToCheckout = useCallback(async () => {
        if (!userId) {
            setError("Debes iniciar sesión para suscribirte.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            if (!STRIPE_PUBLIC_KEY) {
                throw new Error("Configuración incompleta: VITE_STRIPE_PUBLIC_KEY no encontrada en el frontend.");
            }
            const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
            if (!stripe) throw new Error("Stripe no pudo cargarse.");

            // Usar el ID de precio de la configuración (DB) o fallback de env
            const priceId = config.premium_stripe_price_id || import.meta.env.VITE_STRIPE_PRICE_ID;

            if (!priceId) {
                throw new Error("Configuración incompleta: No se encontró un ID de precio válido.");
            }

            // Llamar a la Edge Function de Supabase para crear la sesión de checkout
            const { data, error: fnError } = await supabase.functions.invoke(
                "create-checkout-session",
                {
                    body: {
                        priceId,
                        userId,
                        successUrl: `${window.location.origin}/dashboard?payment=success`,
                        cancelUrl: `${window.location.origin}/dashboard?payment=cancelled`,
                        // Pasamos también el precio y moneda para tracking en base de datos
                        amount: config.premium_price,
                        currency: config.premium_currency
                    },
                }
            );

            if (fnError) throw fnError;
            console.log("Respuesta de Edge Function:", data);
            if (!data?.url) throw new Error("No se recibió la URL de sesión.");

            // Redirigir al checkout de Stripe directamente usando la URL de la sesión
            window.location.href = data.url;
        } catch (err: any) {
            console.error("Error en checkout:", err);
            setError(err.message || "Error al iniciar el pago. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);


    /**
     * Abre el portal de Stripe para gestionar la suscripción
     * (cambiar plan, cancelar, actualizar método de pago)
     */
    const redirectToPortal = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fnError } = await supabase.functions.invoke(
                "create-portal-session",
                {
                    body: {
                        userId,
                        returnUrl: `${window.location.origin}/settings`,
                    },
                }
            );

            if (fnError) throw fnError;
            if (data?.url) window.location.href = data.url;
        } catch (err: any) {
            console.error("Error en portal:", err);
            setError(err.message || "Error al abrir el portal. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    return { redirectToCheckout, redirectToPortal, isLoading, error };
}
