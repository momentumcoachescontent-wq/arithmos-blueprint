-- RPC Function to allow admins to delete users permanently
-- This must be SECURITY DEFINER to allow deleting from auth.users (which requires high privileges)

CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of function creator (service_role/postgres)
SET search_path = public, auth
AS $$
DECLARE
    caller_role TEXT;
    caller_email TEXT;
BEGIN
    -- 1. Get caller info
    SELECT role, email INTO caller_role, caller_email 
    FROM public.profiles 
    WHERE id = auth.uid();

    -- 2. Security Check: Only admins or specific owner emails can delete
    IF NOT (caller_role = 'admin' OR caller_email = 'neto.alvarez@gmail.com') THEN
        RAISE EXCEPTION 'Acceso denegado: Solo administradores pueden realizar esta acción.';
    END IF;

    -- 3. Prevent self-deletion via this specific admin tool (safety first)
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'No puedes eliminar tu propia cuenta desde el panel de administración.';
    END IF;

    -- 4. Delete from auth.users
    -- This will usually trigger ON DELETE CASCADE on public.profiles if the FK is set up correctly.
    -- If not, public.profiles record might stay but without authentication access.
    DELETE FROM auth.users WHERE id = target_user_id;

    -- 5. Explicitly delete from profiles just in case cascade is not set
    DELETE FROM public.profiles WHERE id = target_user_id;
    
    -- Note: Subsequent deletions in other tables (readings, sessions) 
    -- should be handled by ON DELETE CASCADE in the DB schema.
END;
$$;

-- Grant access to authenticated users (the function itself handles internal security check)
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
