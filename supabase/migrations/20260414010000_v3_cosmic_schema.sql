-- ================================================================
-- Arithmos V3 Cosmic — Schema Extension
-- Migración: Campos astrológicos + Tarot Readings + Compatibilidad
-- ================================================================

-- 1. Extender profiles con datos astrológicos
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_time TIME,
  ADD COLUMN IF NOT EXISTS birth_place TEXT,
  ADD COLUMN IF NOT EXISTS birth_place_lat DECIMAL(9,6),
  ADD COLUMN IF NOT EXISTS birth_place_lng DECIMAL(9,6),
  ADD COLUMN IF NOT EXISTS sun_sign TEXT,
  ADD COLUMN IF NOT EXISTS moon_sign TEXT,
  ADD COLUMN IF NOT EXISTS rising_sign TEXT;

-- 2. Tabla de tiradas de tarot
CREATE TABLE IF NOT EXISTS public.tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  spread_type TEXT NOT NULL CHECK (spread_type IN ('daily', 'past-present-future', 'love', 'decision')),
  cards JSONB NOT NULL,          -- Array de {cardId, position, reversed}
  interpretation TEXT,           -- AI-generated (futuro) o local
  cosmic_mood TEXT,              -- mood del día en el momento
  alignment_score INTEGER,       -- 0-100
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.tarot_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tarot readings"
  ON public.tarot_readings FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own tarot readings"
  ON public.tarot_readings FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own tarot readings"
  ON public.tarot_readings FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Índice de performance
CREATE INDEX IF NOT EXISTS tarot_readings_user_id_created_at_idx
  ON public.tarot_readings (user_id, created_at DESC);

-- 3. Tabla de compatibilidad (sinastría)
CREATE TABLE IF NOT EXISTS public.compatibility_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  numerology_score INTEGER,      -- 0-100
  astrology_score INTEGER,       -- 0-100
  overall_score INTEGER,         -- 0-100
  analysis JSONB,                -- {strengths, challenges, advice}
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.compatibility_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own compatibility readings"
  ON public.compatibility_readings FOR SELECT
  USING (
    (SELECT auth.uid()) = user_a OR
    (SELECT auth.uid()) = user_b
  );

CREATE POLICY "Users can insert compatibility readings"
  ON public.compatibility_readings FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_a);

-- 4. Extender diary_entries con cosmic tracking
ALTER TABLE public.diary_entries
  ADD COLUMN IF NOT EXISTS mood TEXT,
  ADD COLUMN IF NOT EXISTS cosmic_mood TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS personal_day INTEGER,
  ADD COLUMN IF NOT EXISTS alignment_score INTEGER;

-- 5. Tabla de rachas espirituales (para gamificación V2)
CREATE TABLE IF NOT EXISTS public.cosmic_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_checkin_at DATE,
  total_checkins INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cosmic_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own streaks"
  ON public.cosmic_streaks FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Upsert trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_cosmic_streak_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER cosmic_streaks_updated_at
  BEFORE UPDATE ON public.cosmic_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_cosmic_streak_timestamp();
