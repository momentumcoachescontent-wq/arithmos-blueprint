-- supabase/migrations/20260407170000_diary_entries.sql
-- In v2 schema, journal_entries was never created, so we create diary_entries directly

DO $$
BEGIN
  -- If journal_entries exists, rename it to diary_entries
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'journal_entries'
  ) THEN
    ALTER TABLE public.journal_entries RENAME TO diary_entries;

    -- Rename the column if it exists
    IF EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'diary_entries' AND column_name = 'personal_number_at_entry'
    ) THEN
      ALTER TABLE public.diary_entries
        RENAME COLUMN personal_number_at_entry TO vibration_at_entry;
    END IF;

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
  ELSIF NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'diary_entries'
  ) THEN
    -- If neither table exists, create diary_entries from scratch
    CREATE TABLE public.diary_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      content TEXT,
      vibration_at_entry INTEGER CHECK (vibration_at_entry BETWEEN 1 AND 9),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

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
  END IF;
END $$;
