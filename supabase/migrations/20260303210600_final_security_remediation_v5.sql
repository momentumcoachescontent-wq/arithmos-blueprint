-- ==========================================
-- ELIMINACIÓN TOTAL DE ALARMAS - V5 (FINAL COMPATIBLE)
-- ==========================================

-- 1. Función de Seguridad para Administradores
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
CREATE OR REPLACE FUNCTION public.award_xp(p_user_id UUID, p_xp INTEGER)
RETURNS VOID AS $$
DECLARE
  current_xp INTEGER;
  current_lvl INTEGER;
  next_lvl_xp INTEGER;
BEGIN
  SELECT xp, level INTO current_xp, current_lvl FROM public.user_stats WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.user_stats (user_id, xp, level) VALUES (p_user_id, p_xp, 1);
    RETURN;
  END IF;

  current_xp := current_xp + p_xp;
  
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


-- 3. Asegurar Función de Registro (Surgical Fix for handle_new_user)
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_is_admin') THEN
    ALTER FUNCTION public.check_is_admin() SET search_path = public;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'award_xp' AND pronamespace = 'public'::regnamespace) THEN
    ALTER FUNCTION public.award_xp(uuid, integer) SET search_path = public;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
  END IF;
END $$;


-- 4. Blindaje de PROFILES (Evitar que el usuario se asigne 'admin')
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    -- Solo permite el cambio si el rol resultante no cambia, o si el que lo hace es admin
    AND (CASE WHEN role IS DISTINCT FROM (SELECT role FROM public.profiles WHERE user_id = auth.uid()) THEN public.check_is_admin() ELSE TRUE END)
  );

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin sees all profiles" ON public.profiles;
DO $$ BEGIN 
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_is_admin') THEN
    EXECUTE 'CREATE POLICY "Admin sees all profiles" ON public.profiles FOR ALL TO authenticated USING (public.check_is_admin())';
  END IF;
END $$;


-- 5. Otras Tablas (Eliminar acceso anónimo y duplicados)

-- MISSIONS
ALTER TABLE IF EXISTS public.missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view missions" ON public.missions;
CREATE POLICY "Users can view missions" ON public.missions FOR SELECT TO authenticated USING (true);

-- JOURNAL_ENTRIES
ALTER TABLE IF EXISTS public.journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own journal" ON public.journal_entries;
CREATE POLICY "Users manage own journal" ON public.journal_entries FOR ALL TO authenticated USING (auth.uid() = user_id);

-- READINGS
ALTER TABLE IF EXISTS public.readings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own readings" ON public.readings;
CREATE POLICY "Users can view own readings" ON public.readings FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin sees all readings" ON public.readings;
DO $$ BEGIN 
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_is_admin') THEN
    EXECUTE 'CREATE POLICY "Admin sees all readings" ON public.readings FOR ALL TO authenticated USING (public.check_is_admin())';
  END IF;
END $$;

-- USER_STATS
ALTER TABLE IF EXISTS public.user_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin sees all stats" ON public.user_stats;
DO $$ BEGIN 
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_is_admin') THEN
    EXECUTE 'CREATE POLICY "Admin sees all stats" ON public.user_stats FOR ALL TO authenticated USING (public.check_is_admin())';
  END IF;
END $$;
DROP POLICY IF EXISTS "Public can view ranking" ON public.user_stats;
CREATE POLICY "Public can view ranking" ON public.user_stats FOR SELECT TO authenticated USING (show_in_ranking = true);

-- SYNC_LOGS
ALTER TABLE IF EXISTS public.sync_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own sync logs" ON public.sync_logs;
DROP POLICY IF EXISTS "Users can view own sync_logs" ON public.sync_logs;
CREATE POLICY "Users can view own sync_logs" ON public.sync_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
