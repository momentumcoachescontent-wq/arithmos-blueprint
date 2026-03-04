-- Módulo de Herramientas de Testing / Gestión de Usuarios: Otorgar Premium Manualmente
-- Solo usuarios con rol 'admin' pueden ejecutar esta función.

CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID AS $$
BEGIN
  -- Validar que el ejecutor es admin
  IF NOT public.check_is_admin() THEN
    RAISE EXCEPTION 'Access denied: User is not an administrator.';
  END IF;

  -- Validar el rol enviado
  IF new_role NOT IN ('freemium', 'premium', 'admin') THEN
    RAISE EXCEPTION 'Invalid role specified.';
  END IF;

  -- Actualizar el perfil
  UPDATE public.profiles
  SET 
    role = new_role,
    subscription_status = CASE WHEN new_role = 'premium' THEN 'active_manual' ELSE 'cancelled' END,
    updated_at = NOW()
  WHERE user_id = target_user_id
  -- Por seguridad no dejamos que se cambie a si mismo a menos de que sea pruebas, pero lo permitimos por simplicidad.
  ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
