-- SECURITY HARDENING - 2026-03-06
-- Resolving Audit points 1, 2, 4, 5

-- 1. Redefine admin_delete_user to be more robust
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, auth
AS $$
BEGIN
    -- Security Check: Use the centralized check_is_admin function
    IF NOT public.check_is_admin() THEN
        RAISE EXCEPTION 'Acceso denegado: Solo administradores pueden realizar esta acción.';
    END IF;

    -- Prevent self-deletion
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'No puedes eliminar tu propia cuenta desde el panel de administración.';
    END IF;

    -- Delete from auth.users (cascade should handle profiles, but we do explicit for safety)
    DELETE FROM auth.users WHERE id = target_user_id;
    DELETE FROM public.profiles WHERE user_id = target_user_id;
END;
$$;

-- 2. Restrict system_prompts RLS
ALTER TABLE public.system_prompts ENABLE ROW LEVEL SECURITY;

-- Remove old loose policies
DROP POLICY IF EXISTS "Anyone can read system prompts" ON public.system_prompts;
DROP POLICY IF EXISTS "Admins can manage system prompts" ON public.system_prompts;
DROP POLICY IF EXISTS "Only authenticated users can read system_prompts" ON public.system_prompts;

-- New strict policies
CREATE POLICY "authenticated_can_read_prompts" 
ON public.system_prompts 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "admins_can_manage_prompts" 
ON public.system_prompts 
FOR ALL 
TO authenticated 
USING (public.check_is_admin());

-- 3. Cleanup existing data (optional but recommended)
-- No specific data to cleanup in this step, but ensures policies are applied.
