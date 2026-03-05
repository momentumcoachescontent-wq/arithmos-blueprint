-- Tabla para el historial de Checkups de Salud del Administrador
CREATE TABLE IF NOT EXISTS public.admin_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service TEXT NOT NULL,          -- 'supabase', 'stripe', 'edge_functions', 'pwa'
    status TEXT NOT NULL,           -- 'ok', 'error'
    latency_ms INTEGER DEFAULT 0,
    notes TEXT,
    checked_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.admin_health_checks ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver y crear registros
CREATE POLICY "Admins can manage health checks"
ON public.admin_health_checks
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Índice para consultas rápidas de historial
CREATE INDEX IF NOT EXISTS idx_health_checks_created_at ON public.admin_health_checks(created_at DESC);
