-- 1. Modificar la función check_is_admin() para inyectar al SuperAdmin irrevocable
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      WHEN auth.jwt() ->> 'email' = 'momentumcoaches.content@gmail.com' THEN true
      ELSE EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE user_id = auth.uid()
        AND role = 'admin'
      )
    END;
$$;

-- 2. Crear Tabla Nativa de Telemetría
CREATE TABLE IF NOT EXISTS public.user_telemetry (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id uuid, -- Para agrupar eventos en una misma "sesión" de interacción continua
    event_name text NOT NULL, -- ej: 'page_view', 'session_ping', 'feature_action'
    target_feature text, -- ej: 'radar', 'journal', 'paywall', 'blueprint'
    duration_seconds integer DEFAULT 0, -- Rellenado en los session_pings
    metadata jsonb DEFAULT '{}'::jsonb, -- Datos adicionales (ej. from_page, resultStatus)
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Habilitar RLS en Telemetría
ALTER TABLE public.user_telemetry ENABLE ROW LEVEL SECURITY;

-- 4. Definir Políticas para Telemetría
-- Un usuario inserta sus propios eventos
CREATE POLICY "Users can insert telemetry" ON public.user_telemetry
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());

-- Un usuario puede leer sus propios eventos (opcional, pero buena práctica)
CREATE POLICY "Users can read own telemetry" ON public.user_telemetry
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid());

-- Los administradores (incluyendo el Master) tienen lectura global por check_is_admin
CREATE POLICY "Admins read all telemetry" ON public.user_telemetry
    FOR SELECT TO authenticated 
    USING (public.check_is_admin());

-- 4. Optimización (Índices)
CREATE INDEX IF NOT EXISTS idx_telemetry_user ON public.user_telemetry(user_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_event ON public.user_telemetry(event_name);
CREATE INDEX IF NOT EXISTS idx_telemetry_target ON public.user_telemetry(target_feature);
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON public.user_telemetry(created_at DESC);
