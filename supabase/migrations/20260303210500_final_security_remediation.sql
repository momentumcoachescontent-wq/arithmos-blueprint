-- ==========================================
-- ELIMINACIÓN TOTAL DE ALARMAS - V4 (FINAL PRO)
-- ==========================================

-- 1. Función de Seguridad para Administradores
-- Esta función permite validar el rol en el servidor, no solo en el cliente.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Función RPC para XP (award_xp)
-- Maneja la lógica de nivel y experiencia de forma centralizada.
CREATE OR REPLACE FUNCTION public.award_xp(p_user_id UUID, p_xp INTEGER)
RETURNS VOID AS $$
DECLARE
  current_xp INTEGER;
  current_lvl INTEGER;
  next_lvl_xp INTEGER;
BEGIN
  -- Obtener stats actuales
  SELECT xp, level INTO current_xp, current_lvl FROM public.user_stats WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.user_stats (user_id, xp, level) VALUES (p_user_id, p_xp, 1);
    RETURN;
  END IF;

  current_xp := current_xp + p_xp;
  
  -- Lógica simple de niveles: cada nivel pide (level^2)*100 XP
  LOOP
    next_lvl_xp := (current_lvl ^ 2) * 100;
    EXIT WHEN current_xp < next_lvl_xp;
    current_lvl := current_lvl + 1;
  END LOOP;

  UPDATE public.user_stats 
  SET xp = current_xp, level = current_lvl, updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 3. Asegurar Función de Registro (SECURITY DEFINER safety)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name = 'handle_new_user'
  ) THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public;
  END IF;
END $$;


-- 4. Blindaje de PROFILES (Evitar que el usuario se asigne 'admin')
-- Primero habilitamos RLS por seguridad redundante
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admin sees all profiles" ON public.profiles;

    -- If role column exists, apply policy that prevents role changes
    IF EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
    ) THEN
      CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (
          auth.uid() = user_id
          AND (CASE WHEN role IS DISTINCT FROM (SELECT role FROM public.profiles WHERE user_id = auth.uid()) THEN public.check_is_admin() ELSE TRUE END)
        );
    ELSE
      -- Simple policy if role column doesn't exist yet
      CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_is_admin' AND pronamespace = 'public'::regnamespace) THEN
      CREATE POLICY "Admin sees all profiles" ON public.profiles FOR ALL TO authenticated USING (public.check_is_admin());
    END IF;
  END IF;
END $$;


-- 5. Otras Tablas (Eliminar acceso anónimo y duplicados) - Only for tables that exist in v2

-- MISSIONS (does NOT exist in v2 - skip entirely)
-- Old code: ALTER TABLE IF EXISTS public.missions ENABLE ROW LEVEL SECURITY;

-- JOURNAL_ENTRIES (renamed to diary_entries in v2 - skip)
-- Old code: ALTER TABLE IF EXISTS public.journal_entries ENABLE ROW LEVEL SECURITY;

-- READINGS (exists in v2)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'readings'
  ) THEN
    ALTER TABLE IF EXISTS public.readings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view own readings" ON public.readings;
    DROP POLICY IF EXISTS "Admin sees all readings" ON public.readings;

    CREATE POLICY "Users can view own readings" ON public.readings FOR SELECT TO authenticated USING (auth.uid() = user_id);

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_is_admin') THEN
      CREATE POLICY "Admin sees all readings" ON public.readings FOR ALL TO authenticated USING (public.check_is_admin());
    END IF;
  END IF;
END $$;

-- USER_STATS (does NOT exist in v2 - skip entirely)
-- Old code: ALTER TABLE IF EXISTS public.user_stats ENABLE ROW LEVEL SECURITY;

-- SYNC_LOGS
ALTER TABLE IF EXISTS public.sync_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own sync logs" ON public.sync_logs;
DROP POLICY IF EXISTS "Users can view own sync_logs" ON public.sync_logs;
CREATE POLICY "Users can view own sync_logs" ON public.sync_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
