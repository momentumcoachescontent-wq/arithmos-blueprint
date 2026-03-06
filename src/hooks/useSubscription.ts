import { useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "";

// Precio premium mensual (configurable vía variable de entorno)
const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || "";

export type SubscriptionStatus = "free" | "premium" | "admin" | "loading";

export function useSubscription(userId?: string) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Redirige al usuario al checkout de Stripe para el plan Premium.
     * Requiere: VITE_STRIPE_PUBLIC_KEY y VITE_STRIPE_PRICE_ID en .env
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

            // Llamar a la Edge Function de Supabase para crear la sesión de checkout
            const { data, error: fnError } = await supabase.functions.invoke(
                "create-checkout-session",
                {
                    body: {
                        priceId: STRIPE_PRICE_ID,
                        userId,
                        successUrl: `${window.location.origin}/dashboard?payment=success`,
                        cancelUrl: `${window.location.origin}/dashboard?payment=cancelled`,
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
     * Redirige al usuario al checkout de MercadoPago.
     */
    const redirectToMercadoPago = useCallback(async () => {
        if (!userId) {
            setError("Debes iniciar sesión para suscribirte.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fnError } = await supabase.functions.invoke(
                "create-mercadopago-preference",
                {
                    body: {
                        userId,
                        successUrl: `${window.location.origin}/dashboard?payment=success`,
                        cancelUrl: `${window.location.origin}/dashboard?payment=cancelled`,
                    },
                }
            );

            if (fnError) throw fnError;
            if (!data?.init_point) throw new Error("No se recibió el punto de inicio de MercadoPago.");

            window.location.href = data.init_point;
        } catch (err: any) {
            console.error("Error en MercadoPago:", err);
            setError(err.message || "Error al iniciar MercadoPago. Intenta de nuevo.");
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

    return { redirectToCheckout, redirectToMercadoPago, redirectToPortal, isLoading, error };
}
