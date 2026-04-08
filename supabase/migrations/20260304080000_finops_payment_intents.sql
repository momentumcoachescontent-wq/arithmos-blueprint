-- Crear tabla de intenciones de pago
CREATE TABLE IF NOT EXISTS public.payment_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('stripe', 'mercadopago')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    checkout_session_id TEXT UNIQUE,
    amount DECIMAL(10, 2),
    currency TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- Solo el usuario autenticado puede ver sus propios intentos
CREATE POLICY "Users can view own payment intents"
ON public.payment_intents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Los usuarios no pueden crear, la creación la hacen las Edge Functions a través del SERVICE_ROLE_KEY
CREATE POLICY "Users cannot insert payment intents"
ON public.payment_intents
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Los administradores (usando SERVICE_ROLE) se saltarán estas políticas por defecto
-- pero añadamos un policy explícito si acceden desde la Interfaz de Admin con JWT:
-- Only create this policy if the role column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    CREATE POLICY "Admins have full access to payment intents"
    ON public.payment_intents
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    );
  END IF;
END $$;

-- Trigger para automatizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_payment_intents_updated_at ON public.payment_intents;
CREATE TRIGGER set_payment_intents_updated_at
BEFORE UPDATE ON public.payment_intents
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
