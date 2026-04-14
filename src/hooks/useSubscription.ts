import { useState, useCallback, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useAppConfig } from "./useAppConfig";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export type Plan = "trial" | "pro" | "freemium";

export interface Subscription {
  plan: Plan;
  trialStartedAt: string;
  trialEndsAt: string;
  subscriptionStartedAt?: string;
  subscriptionEndsAt?: string;
  provider?: "stripe" | "mercadopago";
}

export type SubscriptionStatus = "free" | "premium" | "admin" | "loading";

export function useSubscription(userId?: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { config } = useAppConfig();

  const fetchSubscription = useCallback(async (uid: string) => {
    setIsLoading(true);
    // 1. Try to fetch explicit subscription record first
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', uid)
      .single();

    if (subData && !subError) {
      const sub: Subscription = {
        plan: subData.plan as Plan,
        trialStartedAt: subData.trial_started_at,
        trialEndsAt: subData.trial_ends_at,
        subscriptionStartedAt: subData.subscription_started_at ?? undefined,
        subscriptionEndsAt: subData.subscription_ends_at ?? undefined,
        provider: subData.provider as "stripe" | "mercadopago" | undefined,
      };
      setSubscription(sub);
      setIsLoading(false);
      return sub;
    }

    // 2. PLG HOOK: If no subscription exists, calculate 45 day implicit trial from profile created_at
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('user_id', uid)
      .single();
    
    if (profile?.created_at) {
       const createdDate = new Date(profile.created_at);
       const endsAtDate = new Date(createdDate.getTime() + 45 * 24 * 60 * 60 * 1000); // +45 Days
       
       const implicitPlan: Plan = new Date() > endsAtDate ? "freemium" : "trial";
       
       const implicitSub: Subscription = {
          plan: implicitPlan,
          trialStartedAt: createdDate.toISOString(),
          trialEndsAt: endsAtDate.toISOString(),
       };
       setSubscription(implicitSub);
       setIsLoading(false);
       return implicitSub;
    }

    setIsLoading(false);
    return null;
  }, []);

  useEffect(() => {
    if (userId) fetchSubscription(userId);
  }, [userId, fetchSubscription]);

  // true while on trial or paid Pro — has full access
  const isPremium = subscription
    ? subscription.plan === "trial" || subscription.plan === "pro"
    : false;

  // true when trial has expired and user hasn't paid
  const isTrialExpired = subscription
    ? subscription.plan === "freemium" || (subscription.plan === "trial" && new Date(subscription.trialEndsAt) < new Date())
    : false;

  // days remaining in trial (0 if expired or not on trial)
  const daysLeftInTrial = subscription && subscription.plan === "trial"
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0;

  const redirectToCheckout = useCallback(async () => {
    if (!userId) {
      setError("Debes iniciar sesión para suscribirte.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
      if (!stripe) throw new Error("Stripe no pudo cargarse.");

      const priceId = config.premium_stripe_price_id || import.meta.env.VITE_STRIPE_PRICE_ID;
      if (!priceId) throw new Error("Configuración incompleta: No se encontró un ID de precio válido.");

      const { data, error: fnError } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            priceId,
            userId,
            successUrl: `${window.location.origin}/dashboard?payment=success`,
            cancelUrl: `${window.location.origin}/dashboard?payment=cancelled`,
            amount: config.premium_price || 7, // Default fallback
            currency: config.premium_currency || "usd",
          },
        }
      );

      if (fnError) throw fnError;
      if (!data?.url) throw new Error("No se recibió la URL de sesión.");
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Error en checkout:", err);
      setError(err.message || "Error al iniciar el pago. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, config]);

  const redirectToPortal = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-portal-session",
        { body: { userId, returnUrl: `${window.location.origin}/settings` } }
      );
      if (fnError) throw fnError;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Error al abrir el portal. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    subscription,
    isPremium,
    isTrialExpired,
    daysLeftInTrial,
    fetchSubscription,
    redirectToCheckout,
    redirectToPortal,
    isLoading,
    error,
  };
}
