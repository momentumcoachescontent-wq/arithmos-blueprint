-- Migración para el Coach AI: Sesiones Conversacionales Persistentes

CREATE TABLE IF NOT EXISTS public.coach_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.coach_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.coach_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para coach_sessions
CREATE POLICY "Users can view their own coach sessions"
    ON public.coach_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coach sessions"
    ON public.coach_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coach sessions"
    ON public.coach_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coach sessions"
    ON public.coach_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para coach_messages
CREATE POLICY "Users can view messages of their sessions"
    ON public.coach_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.coach_sessions
            WHERE id = coach_messages.session_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to their sessions"
    ON public.coach_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.coach_sessions
            WHERE id = session_id AND user_id = auth.uid()
        )
    );
