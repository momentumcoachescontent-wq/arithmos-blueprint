-- Create table to track AI token usage
CREATE TABLE IF NOT EXISTS public.ai_token_usage (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    feature text NOT NULL, -- e.g., 'coach_chat', 'friction_radar', 'scanner'
    model_id text NOT NULL, -- e.g., 'gpt-4o-mini', 'gpt-4o'
    prompt_tokens integer NOT NULL DEFAULT 0,
    completion_tokens integer NOT NULL DEFAULT 0,
    estimated_cost_usd numeric(10, 6) NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster aggregation by date, user and feature
CREATE INDEX IF NOT EXISTS ai_token_usage_created_at_idx ON public.ai_token_usage(created_at);
CREATE INDEX IF NOT EXISTS ai_token_usage_user_id_idx ON public.ai_token_usage(user_id);
CREATE INDEX IF NOT EXISTS ai_token_usage_feature_idx ON public.ai_token_usage(feature);

-- RLS Policies
ALTER TABLE public.ai_token_usage ENABLE ROW LEVEL SECURITY;

-- 1. Admins can read everything
CREATE POLICY "Admins can view all AI token usage"
    ON public.ai_token_usage FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 2. Service Role (Edge Functions) can insert 
-- Service role bypasses RLS by default, but we can make it explicit or just let service role do its thing.
-- Users cannot directly insert from the client, they must go through the functions.
