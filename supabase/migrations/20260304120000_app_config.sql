-- =====================================================
-- Fase E10: Tabla de Configuración Dinámica de la App
-- Permite al Admin cambiar precio, moneda y textos sin re-deploy
-- =====================================================

CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Solo los admins pueden modificar la configuración
CREATE POLICY "admin_manage_config" ON public.app_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Cualquier usuario autenticado puede LEER la configuración (para mostrar el precio)
CREATE POLICY "authenticated_read_config" ON public.app_config
  FOR SELECT USING (auth.role() = 'authenticated');

-- Valores por defecto
INSERT INTO public.app_config (key, value) VALUES
  ('premium_price', '9.99'),
  ('premium_currency', 'USD'),
  ('premium_cta_label', 'Activar Premium')
ON CONFLICT (key) DO NOTHING;
