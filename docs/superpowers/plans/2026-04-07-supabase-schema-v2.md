# Supabase Schema V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Supabase schema per the V2 design spec — fix the dual-ID in profiles, separate billing into its own table, add bonds/teams/streak/notifications tables, and update the two critical hooks that touch these tables directly.

**Architecture:** All schema changes land as additive SQL migrations first (preserving live data), followed by destructive cleanup once data is safely migrated. The `useProfile` and `useSubscription` hooks are updated last, after TypeScript types are regenerated.

**Tech Stack:** Supabase (PostgreSQL + RLS), Supabase CLI, TypeScript, React

---

## File Map

| Action | File |
|--------|------|
| Create | `supabase/migrations/20260407100000_profiles_new_columns.sql` |
| Create | `supabase/migrations/20260407110000_create_subscriptions.sql` |
| Create | `supabase/migrations/20260407120000_rebuild_profiles_pk.sql` |
| Create | `supabase/migrations/20260407130000_create_bonds.sql` |
| Create | `supabase/migrations/20260407140000_create_teams.sql` |
| Create | `supabase/migrations/20260407150000_create_streak_notifications.sql` |
| Create | `supabase/migrations/20260407160000_rebuild_readings.sql` |
| Create | `supabase/migrations/20260407170000_diary_entries.sql` |
| Create | `supabase/migrations/20260407180000_migrate_team_readings.sql` |
| Create | `supabase/migrations/20260407190000_rls_new_tables.sql` |
| Regenerate | `src/integrations/supabase/types.ts` |
| Modify | `src/hooks/useProfile.ts` |
| Modify | `src/hooks/useSubscription.ts` |

---

### Task 1: Create git develop branch

**Files:**
- No file changes — git operations only

- [ ] **Step 1: Create and switch to develop branch**

```bash
git checkout -b develop
```

Expected: Switched to a new branch 'develop'

- [ ] **Step 2: Verify you are on develop**

```bash
git branch
```

Expected: `* develop` shown with asterisk

- [ ] **Step 3: Commit to mark branch start**

```bash
git commit --allow-empty -m "chore: start schema v2 develop branch"
```

---

### Task 2: Add new columns to profiles (non-destructive)

This migration only ADDS columns — zero risk to live data.

**Files:**
- Create: `supabase/migrations/20260407100000_profiles_new_columns.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260407100000_profiles_new_columns.sql
-- Add V2 columns to profiles without touching existing data or structure

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS personal_year_number INTEGER,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Expected: Migration applied successfully. No errors.

- [ ] **Step 3: Verify columns exist**

In Supabase Studio (Table Editor → profiles), confirm `personal_year_number` and `onboarding_completed_at` columns appear.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260407100000_profiles_new_columns.sql
git commit -m "feat(db): add personal_year_number and onboarding_completed_at to profiles"
```

---

### Task 3: Create subscriptions table + migrate billing data

**Files:**
- Create: `supabase/migrations/20260407110000_create_subscriptions.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260407110000_create_subscriptions.sql
-- Create subscriptions table and migrate billing data from profiles
-- FK references auth.users (not profiles) so this migration is independent of the profiles PK rebuild

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial', 'pro', 'freemium')),
  trial_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trial_ends_at TIMESTAMPTZ NOT NULL,
  subscription_started_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  mercadopago_subscription_id TEXT,
  provider TEXT CHECK (provider IN ('stripe', 'mercadopago')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Migrate existing users: active subscriptions → 'pro', everyone else → 'trial' (30 days from now)
INSERT INTO public.subscriptions (
  user_id,
  plan,
  trial_started_at,
  trial_ends_at,
  subscription_started_at,
  stripe_customer_id,
  stripe_subscription_id,
  provider
)
SELECT
  user_id,
  CASE
    WHEN subscription_status = 'active' THEN 'pro'
    ELSE 'trial'
  END AS plan,
  now() AS trial_started_at,
  now() + INTERVAL '30 days' AS trial_ends_at,
  CASE WHEN subscription_status = 'active' THEN now() ELSE NULL END AS subscription_started_at,
  stripe_customer_id,
  stripe_subscription_id,
  CASE WHEN stripe_customer_id IS NOT NULL THEN 'stripe' ELSE NULL END AS provider
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Expected: Migration applied. No errors.

- [ ] **Step 3: Verify data migrated**

Run in Supabase SQL Editor:

```sql
SELECT plan, COUNT(*) FROM subscriptions GROUP BY plan;
```

Expected: At least one row returned. Users with `subscription_status = 'active'` in profiles should appear as `plan = 'pro'`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260407110000_create_subscriptions.sql
git commit -m "feat(db): create subscriptions table and migrate billing data from profiles"
```

---

### Task 4: Rebuild profiles PK + remove billing columns

This migration is the most complex. It fixes the dual-ID and removes columns now moved to subscriptions.

**Files:**
- Create: `supabase/migrations/20260407120000_rebuild_profiles_pk.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260407120000_rebuild_profiles_pk.sql
-- Fix the dual-ID in profiles: drop the separate `id` UUID, make `user_id` the PK
-- Remove billing columns (now in subscriptions table)

-- Step A: Fix payment_intents FK
-- Currently: payment_intents.user_id → profiles(id)
-- After: payment_intents.user_id → profiles(user_id)
-- The values in payment_intents.user_id equal profiles.id (not user_id), so we update them first

ALTER TABLE public.payment_intents DROP CONSTRAINT IF EXISTS payment_intents_user_id_fkey;

-- Remap payment_intents.user_id from profiles.id → profiles.user_id
UPDATE public.payment_intents pi
SET user_id = p.user_id
FROM public.profiles p
WHERE pi.user_id = p.id;

-- Step B: Drop profiles PK constraint (CASCADE drops the payment_intents FK we just removed)
ALTER TABLE public.profiles DROP CONSTRAINT profiles_pkey CASCADE;

-- Step C: Drop the old id column
ALTER TABLE public.profiles DROP COLUMN id;

-- Step D: The user_id column already has UNIQUE(user_id) constraint — promote it to PK
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;
ALTER TABLE public.profiles ADD PRIMARY KEY (user_id);

-- Step E: Remove billing columns (now in subscriptions)
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS subscription_tier,
  DROP COLUMN IF EXISTS free_readings_left,
  DROP COLUMN IF EXISTS is_anonymous,
  DROP COLUMN IF EXISTS maturity_number;

-- Step F: Restore payment_intents FK pointing to new profiles PK
ALTER TABLE public.payment_intents
  ADD CONSTRAINT payment_intents_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
  ON DELETE SET NULL;
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Expected: Migration applied. No errors.

- [ ] **Step 3: Verify profiles PK and structure**

Run in Supabase SQL Editor:

```sql
-- Verify user_id is now the PK
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

Expected: `user_id` listed. No `id`, `stripe_customer_id`, `maturity_number` columns.

```sql
-- Verify no orphaned payment_intents
SELECT COUNT(*) FROM payment_intents pi
LEFT JOIN profiles p ON pi.user_id = p.user_id
WHERE p.user_id IS NULL;
```

Expected: `0`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260407120000_rebuild_profiles_pk.sql
git commit -m "feat(db): make user_id the PK in profiles, remove billing columns"
```

---

### Task 5: Create bonds table

**Files:**
- Create: `supabase/migrations/20260407130000_create_bonds.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260407130000_create_bonds.sql

CREATE TABLE public.bonds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  life_path_number INTEGER NOT NULL,
  expression_number INTEGER,
  soul_urge_number INTEGER,
  personality_number INTEGER,
  archetype TEXT,
  relationship_type TEXT CHECK (relationship_type IN ('ally', 'complementary', 'tense', 'neutral')),
  linked_user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_bonds_updated_at
  BEFORE UPDATE ON public.bonds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.bonds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bonds"
  ON public.bonds FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can insert own bonds"
  ON public.bonds FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update own bonds"
  ON public.bonds FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete own bonds"
  ON public.bonds FOR DELETE
  USING (auth.uid() = owner_user_id);
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Expected: Migration applied. No errors.

- [ ] **Step 3: Verify table exists**

Run in Supabase SQL Editor:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'bonds' ORDER BY ordinal_position;
```

Expected: All columns listed including `owner_user_id`, `linked_user_id`, `relationship_type`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260407130000_create_bonds.sql
git commit -m "feat(db): create bonds table for Vínculos feature"
```

---

### Task 6: Create teams + team_members tables

**Files:**
- Create: `supabase/migrations/20260407140000_create_teams.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260407140000_create_teams.sql

CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  bond_id UUID NOT NULL REFERENCES public.bonds(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, bond_id)
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own teams"
  ON public.teams FOR SELECT
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can insert own teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update own teams"
  ON public.teams FOR UPDATE
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete own teams"
  ON public.teams FOR DELETE
  USING (auth.uid() = owner_user_id);

-- team_members: accessible by the team's owner
CREATE POLICY "Team owner can view members"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Team owner can insert members"
  ON public.team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Team owner can delete members"
  ON public.team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.owner_user_id = auth.uid()
    )
  );
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Expected: Migration applied. No errors.

- [ ] **Step 3: Verify tables exist**

```sql
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('teams', 'team_members');
```

Expected: Both rows returned.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260407140000_create_teams.sql
git commit -m "feat(db): create teams and team_members tables for Team Radar Pro"
```

---

### Task 7: Create streak_logs + notifications tables

**Files:**
- Create: `supabase/migrations/20260407150000_create_streak_notifications.sql`

- [ ] **Step 1: Write the migration**

```sql
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
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Expected: Migration applied. No errors.

- [ ] **Step 3: Verify tables**

```sql
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('streak_logs', 'notifications');
```

Expected: Both rows returned.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260407150000_create_streak_notifications.sql
git commit -m "feat(db): create streak_logs and notifications tables"
```

---

### Task 8: Rebuild readings table

Adds `personal_day` and `vibration` columns, removes the duplicate `reading_type` column.

**Files:**
- Create: `supabase/migrations/20260407160000_rebuild_readings.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260407160000_rebuild_readings.sql

-- Add new columns
ALTER TABLE public.readings
  ADD COLUMN IF NOT EXISTS personal_day INTEGER,
  ADD COLUMN IF NOT EXISTS vibration INTEGER CHECK (vibration BETWEEN 1 AND 9),
  ADD COLUMN IF NOT EXISTS personal_month INTEGER,
  ADD COLUMN IF NOT EXISTS personal_year INTEGER,
  ADD COLUMN IF NOT EXISTS audio_url TEXT,
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- Remove the duplicate reading_type column
-- First copy any distinct data from reading_type to type if type is missing
UPDATE public.readings
SET type = reading_type
WHERE type IS NULL AND reading_type IS NOT NULL;

ALTER TABLE public.readings DROP COLUMN IF EXISTS reading_type;

-- Add updated_at if missing
ALTER TABLE public.readings
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Expected: Migration applied. No errors.

- [ ] **Step 3: Verify columns**

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'readings' ORDER BY ordinal_position;
```

Expected: `personal_day`, `vibration` present. `reading_type` absent.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260407160000_rebuild_readings.sql
git commit -m "feat(db): add personal_day/vibration to readings, drop duplicate reading_type"
```

---

### Task 9: Rename journal_entries → diary_entries

**Files:**
- Create: `supabase/migrations/20260407170000_diary_entries.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260407170000_diary_entries.sql

-- Rename table
ALTER TABLE public.journal_entries RENAME TO diary_entries;

-- Rename the column that was personal_number_at_entry → vibration_at_entry
ALTER TABLE public.diary_entries
  RENAME COLUMN personal_number_at_entry TO vibration_at_entry;

-- Update the RLS policies (they are linked to the old table name — drop and recreate)
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
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Expected: Migration applied. No errors.

- [ ] **Step 3: Verify rename**

```sql
SELECT COUNT(*) FROM diary_entries;
```

Expected: Returns count of previous journal_entries rows. No error.

```sql
SELECT COUNT(*) FROM journal_entries;
```

Expected: ERROR — table does not exist. That's correct.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260407170000_diary_entries.sql
git commit -m "feat(db): rename journal_entries → diary_entries, personal_number_at_entry → vibration_at_entry"
```

---

### Task 10: Migrate team_readings → bonds/teams/team_members + drop

**Files:**
- Create: `supabase/migrations/20260407180000_migrate_team_readings.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260407180000_migrate_team_readings.sql
-- Migrate data from team_readings (JSON blob) into bonds + teams + team_members
-- team_readings.members is a JSONB array of objects with at minimum: name, birth_date

DO $$
DECLARE
  tr RECORD;
  member JSONB;
  new_team_id UUID;
  new_bond_id UUID;
  life_path INT;
BEGIN
  FOR tr IN SELECT * FROM public.team_readings LOOP
    -- Create a team for each team_reading
    INSERT INTO public.teams (id, owner_user_id, name, analysis, created_at, updated_at)
    VALUES (gen_random_uuid(), tr.owner_id, tr.title, tr.analysis, tr.created_at, COALESCE(tr.updated_at, tr.created_at))
    RETURNING id INTO new_team_id;

    -- For each member in the JSON array, create a bond and link it to the team
    FOR member IN SELECT * FROM jsonb_array_elements(tr.members) LOOP
      -- Calculate life path: sum digits of YYYYMMDD, reduce to single digit or master
      -- We store the raw value for now; n8n will recalculate properly
      life_path := COALESCE((member->>'life_path_number')::INT, 1);

      INSERT INTO public.bonds (
        id, owner_user_id, name, birth_date,
        life_path_number, archetype, created_at
      )
      VALUES (
        gen_random_uuid(),
        tr.owner_id,
        COALESCE(member->>'name', 'Miembro'),
        COALESCE((member->>'birth_date')::DATE, CURRENT_DATE),
        life_path,
        member->>'archetype',
        tr.created_at
      )
      RETURNING id INTO new_bond_id;

      INSERT INTO public.team_members (team_id, bond_id)
      VALUES (new_team_id, new_bond_id);
    END LOOP;
  END LOOP;
END $$;

-- Drop the old table
DROP TABLE public.team_readings;
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Expected: Migration applied. No errors.

- [ ] **Step 3: Verify migration**

```sql
SELECT COUNT(*) FROM teams;
SELECT COUNT(*) FROM team_members;
SELECT COUNT(*) FROM bonds;
```

Expected: Counts reflect the migrated team_readings rows. No errors.

```sql
SELECT COUNT(*) FROM team_readings;
```

Expected: ERROR — table does not exist. Correct.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260407180000_migrate_team_readings.sql
git commit -m "feat(db): migrate team_readings data to bonds/teams/team_members, drop team_readings"
```

---

### Task 11: Add RLS policies for subscriptions

**Files:**
- Create: `supabase/migrations/20260407190000_rls_new_tables.sql`

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260407190000_rls_new_tables.sql
-- RLS policies for subscriptions table
-- (bonds, teams, team_members, streak_logs, notifications already have RLS from their creation migrations)

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users cannot insert or update subscriptions directly — done by Edge Functions / n8n
-- Admins (service role) handle all writes to subscriptions
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Expected: Migration applied. No errors.

- [ ] **Step 3: Verify RLS is active on subscriptions**

```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename = 'subscriptions';
```

Expected: `rowsecurity = true`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260407190000_rls_new_tables.sql
git commit -m "feat(db): add RLS select policy for subscriptions table"
```

---

### Task 12: Regenerate TypeScript types

**Files:**
- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Regenerate types from Supabase**

```bash
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

Expected: File updated. No CLI errors.

- [ ] **Step 2: Verify key new types are present**

```bash
grep -n "subscriptions\|bonds\|teams\|team_members\|streak_logs\|notifications\|diary_entries" src/integrations/supabase/types.ts
```

Expected: All new table types present. `journal_entries` absent. `diary_entries` present.

- [ ] **Step 3: Check for TypeScript compilation errors**

```bash
npx tsc --noEmit
```

Expected: Errors will appear — this is expected since hooks still reference old types. Note the errors, proceed to Tasks 13–14 to fix them.

- [ ] **Step 4: Commit the regenerated types**

```bash
git add src/integrations/supabase/types.ts
git commit -m "chore: regenerate TypeScript types for schema v2"
```

---

### Task 13: Update useProfile hook

Remove the dead `id` field, remove `maturity_number`, remove subscription fields. Use `user_id` everywhere as the identifier.

**Files:**
- Modify: `src/hooks/useProfile.ts`

- [ ] **Step 1: Update the Profile interface**

In `src/hooks/useProfile.ts`, replace the `Profile` interface (lines 5–28) with:

```typescript
export interface Profile {
  userId: string;          // was: id (profiles.user_id is now the PK)
  name: string;
  birthDate: string;
  lifePathNumber: number;
  expressionNumber?: number;
  soulUrgeNumber?: number;
  personalityNumber?: number;
  personalYearNumber?: number;
  archetype: string;
  description: string;
  narrative?: string;
  powerStrategy?: string;
  shadowWork?: string;
  audioUrl?: string;
  phone?: string;
  role?: "user" | "admin";
  onboardingCompletedAt?: string;
  createdAt: string;
}
```

- [ ] **Step 2: Update fetchProfile**

Replace the `fetchProfile` function body (from `const fetchedProfile: Profile = {` to the closing `}`):

```typescript
const fetchProfile = useCallback(async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (data && !error) {
    const fetchedProfile: Profile = {
      userId: data.user_id,
      name: data.name,
      birthDate: data.birth_date,
      lifePathNumber: data.life_path_number,
      expressionNumber: data.expression_number ?? undefined,
      soulUrgeNumber: data.soul_urge_number ?? undefined,
      personalityNumber: data.personality_number ?? undefined,
      personalYearNumber: data.personal_year_number ?? undefined,
      archetype: data.archetype,
      description: data.archetype_description ?? "",
      narrative: data.narrative ?? undefined,
      powerStrategy: data.power_strategy ?? undefined,
      shadowWork: data.shadow_work ?? undefined,
      audioUrl: data.audio_url ?? undefined,
      role: (data.role as "user" | "admin") ?? "user",
      phone: data.phone ?? undefined,
      onboardingCompletedAt: data.onboarding_completed_at ?? undefined,
      createdAt: data.created_at,
    };

    // Auto-repair missing computed numbers (calculated locally, synced to DB)
    if (!fetchedProfile.expressionNumber || !fetchedProfile.soulUrgeNumber || !fetchedProfile.personalityNumber) {
      fetchedProfile.expressionNumber = reduceToSingleDigitOrMaster(calculateNameValue(fetchedProfile.name, 'all'));
      fetchedProfile.soulUrgeNumber = reduceToSingleDigitOrMaster(calculateNameValue(fetchedProfile.name, 'vowels'));
      fetchedProfile.personalityNumber = reduceToSingleDigitOrMaster(calculateNameValue(fetchedProfile.name, 'consonants'));

      supabase.from('profiles').update({
        expression_number: fetchedProfile.expressionNumber,
        soul_urge_number: fetchedProfile.soulUrgeNumber,
        personality_number: fetchedProfile.personalityNumber,
      }).eq('user_id', userId).then(({ error }) => {
        if (error) console.warn("Auto-reparación falló en DB:", error.message);
      });
    }

    setProfile(fetchedProfile);
    sessionStorage.setItem("arithmos_profile", JSON.stringify(fetchedProfile));
    return fetchedProfile;
  }
  return null;
}, []);
```

- [ ] **Step 3: Update createProfile**

In the `createProfile` function, remove `maturityNumber` everywhere and update the upsert payload:

```typescript
// Remove these lines:
// const maturityNumber = reduceToSingleDigitOrMaster(lifePathNumber + expressionNumber);

// In newProfile object, remove:
// maturityNumber,

// In the supabase upsert, replace the payload with:
const { error: upsertError } = await supabase
  .from('profiles')
  .upsert({
    user_id: userId,
    name: name,
    birth_date: birthDate,
    life_path_number: lifePathNumber,
    expression_number: expressionNumber,
    soul_urge_number: soulUrgeNumber,
    personality_number: personalityNumber,
    archetype: arch.name,
    archetype_description: arch.description,
    narrative: newProfile.narrative ?? null,
    power_strategy: newProfile.powerStrategy ?? null,
    shadow_work: newProfile.shadowWork ?? null,
    audio_url: newProfile.audioUrl ?? null,
    phone: phone ?? null,
  }, { onConflict: 'user_id' });
```

- [ ] **Step 4: Update syncBlueprintIA**

Replace the `.eq('id', profile.id)` line with `.eq('user_id', profile.userId)`:

```typescript
await supabase.from('profiles').update({
  narrative: updatedProfile.narrative,
  power_strategy: updatedProfile.powerStrategy,
  shadow_work: updatedProfile.shadowWork,
  audio_url: updatedProfile.audioUrl,
}).eq('user_id', profile.userId);
```

Also update the `updatedProfile` object to use `userId` instead of `id`:

```typescript
const updatedProfile = {
  ...profile,
  narrative: data.interpretation.narrative,
  powerStrategy: data.interpretation.power_strategy,
  shadowWork: data.interpretation.shadow_work,
  audioUrl: data.interpretation.audio_url,
};
```

- [ ] **Step 5: Verify TypeScript compiles for this file**

```bash
npx tsc --noEmit 2>&1 | grep "useProfile"
```

Expected: No errors for useProfile.ts.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useProfile.ts
git commit -m "feat: update useProfile for schema v2 (single user_id, remove maturity/billing fields)"
```

---

### Task 14: Update useSubscription hook

The hook currently only handles Stripe redirects. Add `fetchSubscription` to read from the new `subscriptions` table and expose plan state to the UI.

**Files:**
- Modify: `src/hooks/useSubscription.ts`

- [ ] **Step 1: Add subscription state + fetch function**

Replace the entire `useSubscription` hook with:

```typescript
import { useState, useCallback, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useAppConfig } from "./useAppConfig";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_live_51LDzMqGdhRtIc6ULYspd91Q7x6Ys26s4si31edRIPLHe9UwDtcifvx9XaD0Pkp5xuIJxJZZjKUFcq5xWL04PVFcH0004oH7hHf";

export type Plan = "trial" | "pro" | "freemium";

export interface Subscription {
  plan: Plan;
  trialStartedAt: string;
  trialEndsAt: string;
  subscriptionStartedAt?: string;
  subscriptionEndsAt?: string;
  provider?: "stripe" | "mercadopago";
}

export type SubscriptionStatus = "free" | "premium" | "admin" | "loading";

export function useSubscription(userId?: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { config } = useAppConfig();

  const fetchSubscription = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', uid)
      .single();

    if (data && !error) {
      const sub: Subscription = {
        plan: data.plan as Plan,
        trialStartedAt: data.trial_started_at,
        trialEndsAt: data.trial_ends_at,
        subscriptionStartedAt: data.subscription_started_at ?? undefined,
        subscriptionEndsAt: data.subscription_ends_at ?? undefined,
        provider: data.provider as "stripe" | "mercadopago" | undefined,
      };
      setSubscription(sub);
      return sub;
    }
    return null;
  }, []);

  useEffect(() => {
    if (userId) fetchSubscription(userId);
  }, [userId, fetchSubscription]);

  // true while on trial or paid Pro — has full access
  const isPremium = subscription
    ? subscription.plan === "trial" || subscription.plan === "pro"
    : false;

  // true when trial has expired and user hasn't paid
  const isTrialExpired = subscription
    ? subscription.plan === "trial" && new Date(subscription.trialEndsAt) < new Date()
    : false;

  // days remaining in trial (0 if expired or not on trial)
  const daysLeftInTrial = subscription && subscription.plan === "trial"
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0;

  const redirectToCheckout = useCallback(async () => {
    if (!userId) {
      setError("Debes iniciar sesión para suscribirte.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
      if (!stripe) throw new Error("Stripe no pudo cargarse.");

      const priceId = config.premium_stripe_price_id || import.meta.env.VITE_STRIPE_PRICE_ID;
      if (!priceId) throw new Error("Configuración incompleta: No se encontró un ID de precio válido.");

      const { data, error: fnError } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            priceId,
            userId,
            successUrl: `${window.location.origin}/dashboard?payment=success`,
            cancelUrl: `${window.location.origin}/dashboard?payment=cancelled`,
            amount: config.premium_price,
            currency: config.premium_currency,
          },
        }
      );

      if (fnError) throw fnError;
      if (!data?.url) throw new Error("No se recibió la URL de sesión.");
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Error en checkout:", err);
      setError(err.message || "Error al iniciar el pago. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, config]);

  const redirectToPortal = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-portal-session",
        { body: { userId, returnUrl: `${window.location.origin}/settings` } }
      );
      if (fnError) throw fnError;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Error al abrir el portal. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    subscription,
    isPremium,
    isTrialExpired,
    daysLeftInTrial,
    fetchSubscription,
    redirectToCheckout,
    redirectToPortal,
    isLoading,
    error,
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "useSubscription"
```

Expected: No errors for useSubscription.ts.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useSubscription.ts
git commit -m "feat: update useSubscription to read from new subscriptions table, add isPremium/daysLeftInTrial"
```

---

### Task 15: Final verification

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: Only errors in pages/components that still reference old fields (e.g. `profile.id`, `profile.maturityNumber`, `role: "freemium"`). These will be fixed as part of each feature's redesign task. Document the remaining errors:

```bash
npx tsc --noEmit 2>&1 | grep "error TS" | sed 's/:.*//' | sort -u
```

This gives you the list of files to address next.

- [ ] **Step 2: Verify all migrations are applied**

```bash
npx supabase db diff
```

Expected: No diff — all migrations are in sync with the remote schema.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: schema v2 complete — all migrations applied, core hooks updated"
```

---

## Scope Note

This plan covers the database layer and the two hooks that are the primary gateway to profile and subscription data. Remaining hooks and components that still reference old fields (`useHistory`, `useJournal`, `useMissions`, etc.) will be updated as part of their respective feature redesign plans (Phase 1, Task 5 — Onboarding + Dashboard V2).
