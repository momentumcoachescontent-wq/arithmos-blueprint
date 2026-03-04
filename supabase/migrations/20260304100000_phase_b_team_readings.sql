-- Fase B: Features Pro
-- Tabla para guardar los análisis de compatibilidad del Radar de Equipo
CREATE TABLE IF NOT EXISTS public.team_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Mi Equipo',
  members JSONB NOT NULL DEFAULT '[]',   -- Array de { name, birth_date, life_path }
  analysis TEXT,                          -- Texto generado por IA
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages team readings"
  ON public.team_readings FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX idx_team_readings_owner ON public.team_readings(owner_id);

-- Trigger updated_at
CREATE TRIGGER set_team_readings_updated_at
  BEFORE UPDATE ON public.team_readings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
