-- ==========================================
-- SURGICAL SECURITY FIX - V3 (COMPATIBILITY MODE for SCHEMA v2)
-- ==========================================
-- NOTE: This migration has been updated for schema v2 compatibility
-- Many old tables referenced here no longer exist (missions, user_missions, user_stats, journal_entries)
-- This migration now safely handles missing tables and applies policies only where applicable

-- 1. Asegurar el search_path de funciones críticas (Usando bloques DO para evitar errores de sintaxis)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_is_admin' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.check_is_admin() SET search_path = public;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'award_xp' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.award_xp(uuid, integer) SET search_path = public;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public;
  END IF;
END $$;

-- 2. Habilitar RLS en todas the tables that exist
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.journal_entries ENABLE ROW LEVEL SECURITY;

-- 3. Only apply policies to tables that actually exist

-- PROFILES (exists in v2)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admin sees all profiles" ON public.profiles;

    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_is_admin' AND pronamespace = 'public'::regnamespace) THEN
      CREATE POLICY "Admin sees all profiles" ON public.profiles FOR ALL TO authenticated USING (public.check_is_admin());
    END IF;
  END IF;
END $$;

-- READINGS (exists in v2)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'readings'
  ) THEN
    DROP POLICY IF EXISTS "Users can view own readings" ON public.readings;
    DROP POLICY IF EXISTS "Users can insert own readings" ON public.readings;
    DROP POLICY IF EXISTS "Admin sees all readings" ON public.readings;

    CREATE POLICY "Users can view own readings" ON public.readings FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own readings" ON public.readings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_is_admin' AND pronamespace = 'public'::regnamespace) THEN
      CREATE POLICY "Admin sees all readings" ON public.readings FOR ALL TO authenticated USING (public.check_is_admin());
    END IF;
  END IF;
END $$;

-- SYNC_LOGS (exists in v2)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sync_logs'
  ) THEN
    DROP POLICY IF EXISTS "Users can view own sync_logs" ON public.sync_logs;
    DROP POLICY IF EXISTS "Users can view own sync logs" ON public.sync_logs;
    DROP POLICY IF EXISTS "Users can insert own sync_logs" ON public.sync_logs;
    DROP POLICY IF EXISTS "Users can delete own sync_logs" ON public.sync_logs;

    CREATE POLICY "Users can view own sync_logs" ON public.sync_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own sync_logs" ON public.sync_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can delete own sync_logs" ON public.sync_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- MISSIONS (does NOT exist in v2 - skip)
-- Tables below do not exist in schema v2 and are skipped entirely
