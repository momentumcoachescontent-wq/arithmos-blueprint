-- supabase/migrations/20260407120000_rebuild_profiles_pk.sql
-- Fix the dual-ID in profiles: drop the separate `id` UUID, make `user_id` the PK
-- Remove billing columns (now in subscriptions table)

-- Step A: Fix payment_intents FK
-- Currently: payment_intents.user_id → profiles(id)
-- After: payment_intents.user_id → profiles(user_id)
-- The values in payment_intents.user_id equal profiles.id (not user_id), so we update them first

ALTER TABLE public.payment_intents DROP CONSTRAINT IF EXISTS payment_intents_user_id_fkey;

-- Remap payment_intents.user_id from profiles.id → profiles.user_id
UPDATE public.payment_intents pi
SET user_id = p.user_id
FROM public.profiles p
WHERE pi.user_id = p.id;

-- Step B: Drop RLS policies that reference profiles.id before we drop that column
-- These will be recreated in Step G using profiles.user_id

DROP POLICY IF EXISTS "Admins have full access to payment intents" ON public.payment_intents;
DROP POLICY IF EXISTS "Admins can view all diagnostics" ON public.friction_diagnostics;
DROP POLICY IF EXISTS "Admins can manage system prompts" ON public.system_prompts;

-- Step C: Drop profiles PK constraint (CASCADE drops any remaining FKs referencing profiles(id))
ALTER TABLE public.profiles DROP CONSTRAINT profiles_pkey CASCADE;

-- Step D: Drop the old id column
ALTER TABLE public.profiles DROP COLUMN id;

-- Step E: Promote user_id to PK
-- Note: We do NOT drop profiles_user_id_key here because other FKs depend on that index.
-- Postgres will merge the unique index into the new PK index automatically.
ALTER TABLE public.profiles ADD PRIMARY KEY (user_id);

-- Step F: Remove billing columns (now in subscriptions)
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS subscription_tier,
  DROP COLUMN IF EXISTS free_readings_left,
  DROP COLUMN IF EXISTS is_anonymous,
  DROP COLUMN IF EXISTS maturity_number;

-- Step G: Restore payment_intents FK pointing to new profiles PK
ALTER TABLE public.payment_intents
  ADD CONSTRAINT payment_intents_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
  ON DELETE SET NULL;

-- Step H: Recreate RLS policies using profiles.user_id instead of profiles.id

CREATE POLICY "Admins have full access to payment intents"
ON public.payment_intents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can view all diagnostics"
ON public.friction_diagnostics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can manage system prompts"
ON public.system_prompts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.email IN ('neto.alvarez@gmail.com'))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.email IN ('neto.alvarez@gmail.com'))
  )
);
