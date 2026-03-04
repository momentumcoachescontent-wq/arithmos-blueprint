-- 1. Habilitar RLS en la tabla missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Permitir que los usuarios autenticados vean las misiones
DROP POLICY IF EXISTS "Users can view missions" ON public.missions;
CREATE POLICY "Users can view missions" ON public.missions 
  FOR SELECT TO authenticated USING (true);


-- 2. Asegurar el search_path de las funciones
ALTER FUNCTION public.check_is_admin() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.award_xp(uuid, integer) SET search_path = public;


-- 3. Restringir políticas públicas/anónimas a "authenticated"

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);


-- readings
DROP POLICY IF EXISTS "Users can view own readings" ON public.readings;
CREATE POLICY "Users can view own readings" ON public.readings 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own readings" ON public.readings;
CREATE POLICY "Users can insert own readings" ON public.readings 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);


-- sync_logs
DROP POLICY IF EXISTS "Users can view own sync_logs" ON public.sync_logs;
CREATE POLICY "Users can view own sync_logs" ON public.sync_logs 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sync_logs" ON public.sync_logs;
CREATE POLICY "Users can insert own sync_logs" ON public.sync_logs 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sync_logs" ON public.sync_logs;
CREATE POLICY "Users can delete own sync_logs" ON public.sync_logs 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- user_missions
DROP POLICY IF EXISTS "Users manage own missions" ON public.user_missions;
CREATE POLICY "Users manage own missions" ON public.user_missions 
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- user_stats
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


-- journal_entries
DROP POLICY IF EXISTS "Users manage own journal" ON public.journal_entries;
CREATE POLICY "Users manage own journal" ON public.journal_entries 
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

