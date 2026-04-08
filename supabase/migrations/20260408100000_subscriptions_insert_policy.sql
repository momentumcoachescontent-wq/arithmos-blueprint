-- Allow authenticated users to insert their own subscription row
-- Needed so Register.tsx can create the trial subscription on sign-up
CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own subscription row
-- Needed for future self-service flows
CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);
