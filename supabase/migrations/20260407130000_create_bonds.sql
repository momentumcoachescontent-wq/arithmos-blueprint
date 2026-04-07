-- supabase/migrations/20260407130000_create_bonds.sql

CREATE TABLE public.bonds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  life_path_number INTEGER NOT NULL,
  expression_number INTEGER,
  soul_urge_number INTEGER,
  personality_number INTEGER,
  archetype TEXT,
  relationship_type TEXT CHECK (relationship_type IN ('ally', 'complementary', 'tense', 'neutral')),
  linked_user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_bonds_updated_at
  BEFORE UPDATE ON public.bonds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.bonds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bonds"
  ON public.bonds FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can insert own bonds"
  ON public.bonds FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update own bonds"
  ON public.bonds FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete own bonds"
  ON public.bonds FOR DELETE
  USING (auth.uid() = owner_user_id);
