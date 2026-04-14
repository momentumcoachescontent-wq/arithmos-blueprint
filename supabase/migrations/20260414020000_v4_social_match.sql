-- ================================================================
-- Arithmos V3 Cosmic — Schema V4 (Social Match)
-- Migración: Perfiles públicos para Tinder Cósmico
-- ================================================================

-- 1. Extender perfiles para exposición pública y bio
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bio TEXT CHECK (char_length(bio) <= 280);

-- No necesitamos añadir más RLS por ahora, porque las políticas actuales 
-- de `profiles` permiten que cualquier persona autenticada haga un SELECT
-- a la tabla de `profiles` en general (el backend en supabase lo maneja por defecto 
-- si la policy SELECT está activada y no tiene un USING estricto filtrando al propio user.
-- Verificamos si existe policy restrictiva y la actualizamos si es necesario.

-- Hacemos que cualquier usuario autenticado pueda ver TODOS los profiles que sean públicos.
-- Ojo: si la policy "Users can view their own profile" previene ver otros, agregamos una:
CREATE POLICY "Users can view public profiles" 
  ON public.profiles FOR SELECT 
  USING (is_public = true OR (SELECT auth.uid()) = user_id);

-- En el frontend y edge function se manejará la consulta para traer solo is_public = true.
