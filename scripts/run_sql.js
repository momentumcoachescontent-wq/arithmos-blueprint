import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const sql = `
CREATE TABLE IF NOT EXISTS public.ai_token_usage (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    feature text NOT NULL,
    model_id text NOT NULL,
    prompt_tokens integer NOT NULL DEFAULT 0,
    completion_tokens integer NOT NULL DEFAULT 0,
    estimated_cost_usd numeric(10, 6) NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS ai_token_usage_created_at_idx ON public.ai_token_usage(created_at);
CREATE INDEX IF NOT EXISTS ai_token_usage_user_id_idx ON public.ai_token_usage(user_id);
CREATE INDEX IF NOT EXISTS ai_token_usage_feature_idx ON public.ai_token_usage(feature);
ALTER TABLE public.ai_token_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all AI token usage" ON public.ai_token_usage FOR SELECT USING ( EXISTS ( SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin' ) );
`

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).select()
  console.log("Error:", error)
  console.log("Data:", data)
}
run()
