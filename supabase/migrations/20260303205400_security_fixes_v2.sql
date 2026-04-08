-- ==========================================
-- SURGICAL SECURITY FIX - ARITHMOS
-- ==========================================

-- 1. Asegurar el search_path de funciones críticas (safely)
DO $$
BEGIN
  -- check_is_admin
  IF EXISTS (
    SELECT FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name = 'check_is_admin'
  ) THEN
    ALTER FUNCTION public.check_is_admin() SET search_path = public;
  END IF;

  -- update_updated_at_column
  IF EXISTS (
    SELECT FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name = 'update_updated_at_column'
  ) THEN
    ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
  END IF;

  -- award_xp
  IF EXISTS (
    SELECT FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name = 'award_xp'
  ) THEN
    ALTER FUNCTION public.award_xp(uuid, integer) SET search_path = public;
  END IF;

  -- handle_new_user
  IF EXISTS (
    SELECT FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_name = 'handle_new_user'
  ) THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public;
  END IF;
END $$;

-- 2. Habilitar RLS en todas las tablas (por si acaso)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.journal_entries ENABLE ROW LEVEL SECURITY;

-- 3. Limpieza Quirúrgica y Reconstrucción de Políticas (TO authenticated)

-- PROFILES
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

    -- Only add admin policy if check_is_admin function exists
    IF EXISTS (
      SELECT FROM information_schema.routines
      WHERE routine_schema = 'public' AND routine_name = 'check_is_admin'
    ) THEN
      CREATE POLICY "Admin sees all profiles" ON public.profiles FOR ALL TO authenticated USING (public.check_is_admin());
    END IF;
  END IF;
END $$;

-- READINGS
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

    -- Only add admin policy if check_is_admin function exists
    IF EXISTS (
      SELECT FROM information_schema.routines
      WHERE routine_schema = 'public' AND routine_name = 'check_is_admin'
    ) THEN
      CREATE POLICY "Admin sees all readings" ON public.readings FOR ALL TO authenticated USING (public.check_is_admin());
    END IF;
  END IF;
END $$;

-- SYNC_LOGS
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

-- MISSIONS
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'missions'
  ) THEN
    DROP POLICY IF EXISTS "Users can view missions" ON public.missions;
    CREATE POLICY "Users can view missions" ON public.missions FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- USER_MISSIONS
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_missions'
  ) THEN
    DROP POLICY IF EXISTS "Users manage own missions" ON public.user_missions;
    CREATE POLICY "Users manage own missions" ON public.user_missions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- USER_STATS
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_stats'
  ) THEN
    DROP POLICY IF EXISTS "Users can manage own stats" ON public.user_stats;
    DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
    DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
    DROP POLICY IF EXISTS "Admin sees all stats" ON public.user_stats;
    DROP POLICY IF EXISTS "Public can view ranking" ON public.user_stats;

    CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can manage own stats" ON public.user_stats FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Public can view ranking" ON public.user_stats FOR SELECT TO authenticated USING (show_in_ranking = true);

    -- Only add admin policy if check_is_admin function exists
    IF EXISTS (
      SELECT FROM information_schema.routines
      WHERE routine_schema = 'public' AND routine_name = 'check_is_admin'
    ) THEN
      CREATE POLICY "Admin sees all stats" ON public.user_stats FOR ALL TO authenticated USING (public.check_is_admin());
    END IF;
  END IF;
END $$;

-- JOURNAL_ENTRIES
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'journal_entries'
  ) THEN
    DROP POLICY IF EXISTS "Users manage own journal" ON public.journal_entries;
    CREATE POLICY "Users manage own journal" ON public.journal_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
