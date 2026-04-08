-- Add V2 columns to profiles without touching existing data or structure
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS personal_year_number INTEGER,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
