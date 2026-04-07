-- supabase/migrations/20260407170000_diary_entries.sql

-- Rename table
ALTER TABLE public.journal_entries RENAME TO diary_entries;

-- Rename the column
ALTER TABLE public.diary_entries
  RENAME COLUMN personal_number_at_entry TO vibration_at_entry;

-- Update the RLS policies (linked to old table name — drop and recreate)
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.diary_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.diary_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON public.diary_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.diary_entries;

CREATE POLICY "Users can view own diary_entries"
  ON public.diary_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary_entries"
  ON public.diary_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary_entries"
  ON public.diary_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary_entries"
  ON public.diary_entries FOR DELETE
  USING (auth.uid() = user_id);
