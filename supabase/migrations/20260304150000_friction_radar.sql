-- Friction Radar Diagnostics Table
CREATE TABLE IF NOT EXISTS public.friction_diagnostics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_text TEXT NOT NULL,
    
    -- Scores for the 5 sliders (0-100)
    score_fear_judgment INTEGER DEFAULT 0,
    score_need_certainty INTEGER DEFAULT 0,
    score_overplanning INTEGER DEFAULT 0,
    score_emotional_load INTEGER DEFAULT 0,
    score_clarity_next_step INTEGER DEFAULT 0,
    
    -- Resulting Profile
    profile_id TEXT NOT NULL, -- e.g., 'perfeccionista_paralizado'
    friction_level TEXT NOT NULL, -- 'baja', 'media', 'alta'
    
    -- Tracking
    steps_completed INTEGER DEFAULT 1, -- 1, 2, or 3
    is_saved_to_history BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.friction_diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own diagnostics"
ON public.friction_diagnostics
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all diagnostics"
ON public.friction_diagnostics
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_friction_diagnostics_user_id ON public.friction_diagnostics(user_id);
