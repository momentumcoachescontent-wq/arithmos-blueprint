-- supabase/migrations/20260407160000_rebuild_readings.sql

-- Add new columns
ALTER TABLE public.readings
  ADD COLUMN IF NOT EXISTS personal_day INTEGER,
  ADD COLUMN IF NOT EXISTS vibration INTEGER CHECK (vibration BETWEEN 1 AND 9),
  ADD COLUMN IF NOT EXISTS personal_month INTEGER,
  ADD COLUMN IF NOT EXISTS personal_year INTEGER,
  ADD COLUMN IF NOT EXISTS audio_url TEXT,
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- Remove the duplicate reading_type column (if it exists)
-- First copy any distinct data from reading_type to type if type is missing
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'readings' AND column_name = 'reading_type'
  ) THEN
    UPDATE public.readings
    SET type = reading_type
    WHERE type IS NULL AND reading_type IS NOT NULL;

    ALTER TABLE public.readings DROP COLUMN reading_type;
  END IF;
END $$;

-- Add updated_at if missing
ALTER TABLE public.readings
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
