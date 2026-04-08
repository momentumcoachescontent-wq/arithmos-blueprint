-- supabase/migrations/20260407150000_create_streak_notifications.sql

CREATE TABLE public.streak_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  logged_date DATE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('pulse', 'journal', 'bond', 'mission')),
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, logged_date, action_type)
);

ALTER TABLE public.streak_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak_logs"
  ON public.streak_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak_logs"
  ON public.streak_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pulse', 'bond_alert', 'streak', 'trial_expiring', 'winback')),
  channel TEXT NOT NULL CHECK (channel IN ('push', 'email', 'whatsapp')),
  title TEXT,
  body TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);
