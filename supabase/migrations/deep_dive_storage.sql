-- ============================================================
-- Arithmos: Deep Dive Reports Storage Bucket
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Crear el bucket para reportes Deep Dive
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deep-dive-reports',
  'deep-dive-reports',
  false,  -- Privado: solo accedible mediante URLs firmadas
  10485760, -- 10MB max por archivo
  ARRAY['text/html', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['text/html', 'application/pdf'];

-- Política RLS: El usuario solo puede escribir en su propia carpeta (user_id prefix)
CREATE POLICY "Users can upload their own reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deep-dive-reports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Solo el service_role puede leer (para URLs firmadas desde Edge Functions)
-- Los usuarios acceden vía signed URLs generadas por la Edge Function.

-- Política para que el service_role lea sin restricciones
CREATE POLICY "Service role has full access"
ON storage.objects FOR SELECT
USING (bucket_id = 'deep-dive-reports');

-- Índice en tabla readings para el tipo deep_dive_pdf
CREATE INDEX IF NOT EXISTS readings_deep_dive_idx
ON readings(user_id, type)
WHERE type = 'deep_dive_pdf';
