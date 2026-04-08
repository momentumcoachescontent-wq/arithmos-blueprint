-- Update existing system_prompts to Claude models
UPDATE public.system_prompts SET model_id = 'claude-sonnet-4-6', updated_at = now()
WHERE feature = 'coach_chat';

UPDATE public.system_prompts SET model_id = 'claude-haiku-4-5-20251001', updated_at = now()
WHERE feature IN ('scanner', 'daily_pulse', 'friction_radar');

-- Add coach_summarize as a separate configurable feature
INSERT INTO public.system_prompts (feature, content, model_id)
VALUES (
  'coach_summarize',
  'Resume la siguiente conversación en un párrafo conciso enfocado en: 1. El patrón de sombra que apareció. 2. El aprendizaje u objetivo concreto establecido. Sé directo y analítico. Sin saludos. Sin positividad vacía.',
  'claude-haiku-4-5-20251001'
)
ON CONFLICT (feature) DO UPDATE
  SET model_id = 'claude-haiku-4-5-20251001', updated_at = now();
