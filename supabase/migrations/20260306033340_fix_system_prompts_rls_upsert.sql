-- Fix RLS for system_prompts to allow upsert (INSERT + UPDATE)

-- Drop the old policy
DROP POLICY IF EXISTS "Admins can manage system prompts" ON public.system_prompts;

-- Create the new policy with explicit WITH CHECK for inserts/upserts
CREATE POLICY "Admins can manage system prompts" 
ON public.system_prompts 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.email IN ('neto.alvarez@gmail.com'))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.email IN ('neto.alvarez@gmail.com'))
    )
);
