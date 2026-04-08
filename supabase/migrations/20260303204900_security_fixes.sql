-- Old security fixes migration - only apply to tables that exist
-- This migration is kept for history but many of the tables no longer exist in schema v2

-- 1. Habilitar RLS en la tabla missions (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'missions'
  ) THEN
    ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view missions" ON public.missions;
    CREATE POLICY "Users can view missions" ON public.missions
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- 2. Asegurar el search_path de las funciones (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = 'check_is_admin'
  ) THEN
    ALTER FUNCTION public.check_is_admin() SET search_path = public;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = 'update_updated_at_column'
  ) THEN
    ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name = 'award_xp'
  ) THEN
    ALTER FUNCTION public.award_xp(uuid, integer) SET search_path = public;
  END IF;
END $$;

-- 3. Restringir políticas públicas/anónimas a "authenticated"

-- profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    CREATE POLICY "Users can view own profile" ON public.profiles
      FOR SELECT TO authenticated USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    CREATE POLICY "Users can insert own profile" ON public.profiles
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- readings
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'readings'
  ) THEN
    DROP POLICY IF EXISTS "Users can view own readings" ON public.readings;
    CREATE POLICY "Users can view own readings" ON public.readings
      FOR SELECT TO authenticated USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own readings" ON public.readings;
    CREATE POLICY "Users can insert own readings" ON public.readings
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- sync_logs
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'sync_logs'
  ) THEN
    DROP POLICY IF EXISTS "Users can view own sync_logs" ON public.sync_logs;
    CREATE POLICY "Users can view own sync_logs" ON public.sync_logs
      FOR SELECT TO authenticated USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own sync_logs" ON public.sync_logs;
    CREATE POLICY "Users can insert own sync_logs" ON public.sync_logs
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own sync_logs" ON public.sync_logs;
    CREATE POLICY "Users can delete own sync_logs" ON public.sync_logs
      FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- user_missions (if exists in new schema)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'user_missions'
  ) THEN
    DROP POLICY IF EXISTS "Users manage own missions" ON public.user_missions;
    CREATE POLICY "Users manage own missions" ON public.user_missions
      FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- user_stats (if exists in new schema)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'user_stats'
  ) THEN
    DROP POLICY IF EXISTS "Users can manage own stats" ON public.user_stats;
    CREATE POLICY "Users can manage own stats" ON public.user_stats
      FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
    CREATE POLICY "Users can update own stats" ON public.user_stats
      FOR UPDATE TO authenticated USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
    CREATE POLICY "Users can view own stats" ON public.user_stats
      FOR SELECT TO authenticated USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Public can view ranking" ON public.user_stats;
    CREATE POLICY "Public can view ranking" ON public.user_stats
      FOR SELECT TO authenticated USING (show_in_ranking = true);
  END IF;
END $$;

-- journal_entries (if exists - renamed to diary_entries in new schema)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'journal_entries'
  ) THEN
    DROP POLICY IF EXISTS "Users manage own journal" ON public.journal_entries;
    CREATE POLICY "Users manage own journal" ON public.journal_entries
      FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
