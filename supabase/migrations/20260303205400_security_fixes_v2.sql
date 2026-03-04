-- ==========================================
-- SURGICAL SECURITY FIX - ARITHMOS
-- ==========================================

-- 1. Asegurar el search_path de funciones críticas
ALTER FUNCTION IF EXISTS public.check_is_admin() SET search_path = public;
ALTER FUNCTION IF EXISTS public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION IF EXISTS public.award_xp(uuid, integer) SET search_path = public;
ALTER FUNCTION IF EXISTS public.handle_new_user() SET search_path = public;


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
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin sees all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Si existe la función check_is_admin, la usamos. Si no, esta política simplemente no dejará pasar a nadie que no sea admin (si es que se valida el rol en el JWT)
CREATE POLICY "Admin sees all profiles" ON public.profiles FOR ALL TO authenticated USING (public.check_is_admin());


-- READINGS
DROP POLICY IF EXISTS "Users can view own readings" ON public.readings;
DROP POLICY IF EXISTS "Users can insert own readings" ON public.readings;
DROP POLICY IF EXISTS "Admin sees all readings" ON public.readings;

CREATE POLICY "Users can view own readings" ON public.readings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own readings" ON public.readings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin sees all readings" ON public.readings FOR ALL TO authenticated USING (public.check_is_admin());


-- SYNC_LOGS (Limpieza de variantes con y sin guión bajo)
DROP POLICY IF EXISTS "Users can view own sync_logs" ON public.sync_logs;
DROP POLICY IF EXISTS "Users can view own sync logs" ON public.sync_logs;
DROP POLICY IF EXISTS "Users can insert own sync_logs" ON public.sync_logs;
DROP POLICY IF EXISTS "Users can delete own sync_logs" ON public.sync_logs;

CREATE POLICY "Users can view own sync_logs" ON public.sync_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sync_logs" ON public.sync_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sync_logs" ON public.sync_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- MISSIONS
DROP POLICY IF EXISTS "Users can view missions" ON public.missions;
CREATE POLICY "Users can view missions" ON public.missions FOR SELECT TO authenticated USING (true);


-- USER_MISSIONS
DROP POLICY IF EXISTS "Users manage own missions" ON public.user_missions;
CREATE POLICY "Users manage own missions" ON public.user_missions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- USER_STATS
DROP POLICY IF EXISTS "Users can manage own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Admin sees all stats" ON public.user_stats;
DROP POLICY IF EXISTS "Public can view ranking" ON public.user_stats;

CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own stats" ON public.user_stats FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin sees all stats" ON public.user_stats FOR ALL TO authenticated USING (public.check_is_admin());
CREATE POLICY "Public can view ranking" ON public.user_stats FOR SELECT TO authenticated USING (show_in_ranking = true);


-- JOURNAL_ENTRIES
DROP POLICY IF EXISTS "Users manage own journal" ON public.journal_entries;
CREATE POLICY "Users manage own journal" ON public.journal_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
