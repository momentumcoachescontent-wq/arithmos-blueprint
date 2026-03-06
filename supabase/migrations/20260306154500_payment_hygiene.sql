-- Higiene de Código: Eliminación de MercadoPago
-- Este script limpia las restricciones de la tabla payment_intents para reflejar que el sistema ahora es exclusivo de Stripe.

-- 1. Actualizar la restricción de 'provider' en payment_intents
ALTER TABLE public.payment_intents 
DROP CONSTRAINT IF EXISTS payment_intents_provider_check;

ALTER TABLE public.payment_intents 
ADD CONSTRAINT payment_intents_provider_check 
CHECK (provider IN ('stripe'));

-- 2. Limpiar cualquier rastro de configuración de MercadoPago en app_config si existiera
DELETE FROM public.app_config WHERE key LIKE '%mercadopago%';

-- 3. Nota: No eliminamos la tabla payment_intents ya que es vital para el historial de Stripe.
