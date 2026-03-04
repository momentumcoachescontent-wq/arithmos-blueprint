-- Migración: Añadir campo de teléfono a perfiles
-- Fecha: 2026-03-04

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT;

COMMENT ON COLUMN public.profiles.phone IS 'Número de teléfono del usuario para integraciones futuras (WhatsApp)';
