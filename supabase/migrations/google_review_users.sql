-- ============================================================
-- Usuarios de Prueba para Google Play Review (Arithmos)
-- Versión corregida v4 (Incluye Rol Admin para Premium)
-- Instrucciones: Copiar y pegar en el SQL Editor de Supabase
-- ============================================================

-- 1. CORRECCIÓN DEL TRIGGER: Fix para el error de tipo DATE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, birth_date, life_path_number, archetype, archetype_description)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'birth_date', '2000-01-01')::DATE, -- Cast explícito ::DATE
    1,
    'El Mago',
    'Perfil inicializado por sistema'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. BLOQUE DE EJECUCIÓN: Creación de Usuarios
DO $$
DECLARE
    u1_id UUID;
    u2_id UUID;
BEGIN
    -- Manejo del Usuario Freemium (Google Reviewer)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'google-reviewer@arithmos.mx') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, recovery_sent_at, last_sign_in_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'google-reviewer@arithmos.mx',
            extensions.crypt('Arithmos2026!', extensions.gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Google Reviewer (Freemium)"}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO u1_id;
    ELSE
        SELECT id INTO u1_id FROM auth.users WHERE email = 'google-reviewer@arithmos.mx';
    END IF;

    -- Manejo del Usuario Premium + Admin (Google Premium)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'google-premium@arithmos.mx') THEN
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, 
            email_confirmed_at, recovery_sent_at, last_sign_in_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
            confirmation_token, email_change, email_change_token_new, recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'google-premium@arithmos.mx',
            extensions.crypt('Arithmos2026!', extensions.gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Google Premium (Admin)"}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO u2_id;
    ELSE
        SELECT id INTO u2_id FROM auth.users WHERE email = 'google-premium@arithmos.mx';
    END IF;

    -- 3. Actualizar perfiles de forma robusta
    -- Freemium
    UPDATE public.profiles
    SET 
        role = 'freemium',
        subscription_status = 'inactive',
        archetype = 'El Mago',
        birth_date = '1985-05-15',
        updated_at = NOW()
    WHERE user_id = u1_id;

    -- Premium + Admin
    UPDATE public.profiles
    SET 
        role = 'admin', -- Actualizado a admin como se solicitó
        subscription_status = 'active_manual',
        archetype = 'El Sabio',
        birth_date = '1990-10-20',
        updated_at = NOW()
    WHERE user_id = u2_id;

END $$;

-- ============================================================
-- ✅ Script ejecutado. u2 ahora es Administrador.
-- ============================================================
