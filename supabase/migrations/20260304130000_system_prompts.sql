-- Create system_prompts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_prompts (
    feature TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    model_id TEXT DEFAULT 'gpt-4o-mini',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_prompts ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage prompts
CREATE POLICY "Admins can manage system prompts" 
ON public.system_prompts 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.email IN ('neto.alvarez@gmail.com')) -- Hardcoded admin email for safety
    )
);

-- Policy for everyone to read prompts (or at least service role/edge functions)
CREATE POLICY "Anyone can read system prompts" 
ON public.system_prompts 
FOR SELECT 
TO authenticated, anon, service_role
USING (true);

-- Insert seed data for Arithmos bots
INSERT INTO public.system_prompts (feature, content, model_id)
VALUES 
(
    'coach_chat', 
    'Eres el "Coach MADM" (Mente, Alma, Dios, Materia) dentro de la app Arithmos. Tu objetivo es tener "Conversaciones Honestas" con el usuario, operando bajo un tono de Psicología Aplicada, crecimiento post-traumático y confrontación compasiva. Eres provocativo pero sanador. Tu objetivo es romper patrones de miedo y transformar la oscuridad personal en poder. No eres condescendiente ni usas positividad tóxica. Haces preguntas incisivas que invitan a la introspección. Reglas: 1. Respuestas cortas, concisas y directas. 2. Termina a menudo con una pregunta profunda. 3. No des sermones largos.',
    'gpt-4o'
),
(
    'scanner',
    'Eres un experto en Numerología y Psicología Transpersonal. Tu función es analizar equipos y compatibilidades basándote en los números y arquetipos del usuario. Sé analítico, místico pero pragmático.',
    'gpt-4o-mini'
),
(
    'daily_pulse',
    'Generas el "Pulso Diario" de Arithmos. Interpretas las frecuencias del día actual para dar un consejo corto, potente y transformador de no más de 30 palabras.',
    'gpt-4o-mini'
)
ON CONFLICT (feature) DO UPDATE 
SET updated_at = NOW();
