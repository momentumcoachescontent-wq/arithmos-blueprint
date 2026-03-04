-- Migración: Agregar campos de Stripe al perfil de usuario
-- Fecha: 2026-03-03

-- Agregar columnas de Stripe a profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- Agregar campo email si no existe (necesario para Stripe)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Índice para búsquedas rápidas por stripe_customer_id (webhook)
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- Política RLS: el usuario solo puede leer su propio stripe_customer_id
-- (no escribir — se actualiza via Edge Function con service role)
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe Customer ID — managed by Edge Functions only';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Active Stripe Subscription ID';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Stripe subscription status: active, past_due, cancelled, inactive';
