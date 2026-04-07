-- supabase/migrations/20260407190000_rls_new_tables.sql

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);
