-- ================================================================
-- Arithmos V3 Cosmic — Schema V5 (Likes & Matches)
-- Migración: Interacciones sociales + Ampliación de Notificaciones
-- ================================================================

-- 1. Crear tabla de interacciones (Likes)
CREATE TABLE IF NOT EXISTS public.cosmic_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  is_mutual BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- Evitar que alguien se de like a sí mismo (aunque la UI lo bloquee)
  CONSTRAINT no_self_like CHECK (sender_id <> receiver_id),
  -- Un solo like por par direccionado
  UNIQUE (sender_id, receiver_id)
);

-- RLS para interacciones
ALTER TABLE public.cosmic_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interactions"
  ON public.cosmic_interactions FOR SELECT
  USING ((SELECT auth.uid()) = sender_id OR (SELECT auth.uid()) = receiver_id);

CREATE POLICY "Users can insert their own interactions"
  ON public.cosmic_interactions FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = sender_id);

-- 2. Ampliar tipos de notificaciones
-- Como no queremos recrear la tabla, actualizamos el constraint de check.
-- Primero encontramos el nombre del constraint (usualmente notifications_type_check si fue creado así)
-- O lo hacemos de forma genérica droppeando cualquier check en 'type' y volviendo a crear.

DO $$
BEGIN
    ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
    ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
        CHECK (type IN ('pulse', 'bond_alert', 'streak', 'trial_expiring', 'winback', 'vibe_like', 'cosmic_match'));
END $$;
