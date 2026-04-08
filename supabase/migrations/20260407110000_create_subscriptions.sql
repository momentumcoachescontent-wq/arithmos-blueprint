-- supabase/migrations/20260407110000_create_subscriptions.sql
-- Create subscriptions table and migrate billing data from profiles
-- FK references auth.users (not profiles) so this migration is independent of the profiles PK rebuild

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial', 'pro', 'freemium')),
  trial_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trial_ends_at TIMESTAMPTZ NOT NULL,
  subscription_started_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  mercadopago_subscription_id TEXT,
  provider TEXT CHECK (provider IN ('stripe', 'mercadopago')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Migrate existing users: active subscriptions → 'pro', everyone else → 'trial' (30 days from now)
INSERT INTO public.subscriptions (
  user_id,
  plan,
  trial_started_at,
  trial_ends_at,
  subscription_started_at,
  stripe_customer_id,
  stripe_subscription_id,
  provider
)
SELECT
  user_id,
  CASE
    WHEN subscription_status = 'active' THEN 'pro'
    ELSE 'trial'
  END AS plan,
  now() AS trial_started_at,
  now() + INTERVAL '30 days' AS trial_ends_at,
  CASE WHEN subscription_status = 'active' THEN now() ELSE NULL END AS subscription_started_at,
  stripe_customer_id,
  stripe_subscription_id,
  CASE WHEN stripe_customer_id IS NOT NULL THEN 'stripe' ELSE NULL END AS provider
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;
