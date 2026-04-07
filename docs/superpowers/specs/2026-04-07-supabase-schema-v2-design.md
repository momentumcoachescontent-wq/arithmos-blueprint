# Supabase Schema V2 — Design Spec
**Date:** 2026-04-07
**Project:** Arithmos Blueprint · Plan Maestro V2.1
**Status:** Approved

---

## Context

The existing schema has two structural problems: `profiles` has a confusing dual-ID (`id` + `user_id`), and `team_readings` stores members as a JSON blob. This is a full rebuild that fixes both, adds the tables required by Phase 1, and separates billing from identity.

The app is live. Migration scripts are required to preserve existing user data.

---

## Business Model (informs schema)

- All new users start with a **30-day premium trial** (`plan = 'trial'`)
- At day 30: pay → `plan = 'pro'` ($9.99/mo), or revert → `plan = 'freemium'`
- Deep Dive is a one-off $25 purchase (tracked in `payment_intents`)
- Team plan is $49/mo (Pro account + team features)
- Subscription state is the primary UI gate — lives in its own table

---

## Schema

### Rebuilt: `profiles`

Single PK `user_id` (UUID, FK to `auth.users`). All subscription and billing fields removed.

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | UUID PK | FK auth.users — replaces dual id/user_id |
| `name` | TEXT NOT NULL | |
| `birth_date` | DATE NOT NULL | |
| `email` | TEXT | |
| `phone` | TEXT | |
| `role` | TEXT DEFAULT 'user' | 'user' \| 'admin' |
| `life_path_number` | INT NOT NULL | |
| `expression_number` | INT | |
| `soul_urge_number` | INT | |
| `personality_number` | INT | |
| `personal_year_number` | INT | Stored for perf, recomputed annually by n8n |
| `archetype` | TEXT NOT NULL | '1'–'9', '11', '22', '33' |
| `archetype_description` | TEXT | |
| `narrative` | TEXT | AI-generated on onboarding |
| `power_strategy` | TEXT | |
| `shadow_work` | TEXT | |
| `audio_url` | TEXT | |
| `onboarding_completed_at` | TIMESTAMPTZ | NULL until onboarding done |
| `created_at` | TIMESTAMPTZ DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ DEFAULT now() | |

**Removed from V1:** `id` (separate UUID), `free_readings_left`, `is_anonymous`, `maturity_number`, `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, `subscription_tier`

---

### New: `subscriptions`

One row per user. Single source of truth for trial and billing state.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK UNIQUE | FK profiles(user_id) |
| `plan` | TEXT NOT NULL DEFAULT 'trial' | 'trial' \| 'pro' \| 'freemium' |
| `trial_started_at` | TIMESTAMPTZ NOT NULL DEFAULT now() | |
| `trial_ends_at` | TIMESTAMPTZ NOT NULL | trial_started_at + 30 days |
| `subscription_started_at` | TIMESTAMPTZ | Set when user pays |
| `subscription_ends_at` | TIMESTAMPTZ | Set on cancellation |
| `stripe_customer_id` | TEXT | |
| `stripe_subscription_id` | TEXT | |
| `mercadopago_subscription_id` | TEXT | |
| `provider` | TEXT | 'stripe' \| 'mercadopago' |
| `created_at` | TIMESTAMPTZ DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ DEFAULT now() | |

**Lifecycle:**
1. User registers → row created with `plan = 'trial'`, `trial_ends_at = now() + 30 days`
2. User pays → `plan = 'pro'`, `subscription_started_at` set
3. Trial expires without payment → n8n cron sets `plan = 'freemium'`
4. Pro cancels → `plan = 'freemium'` when `subscription_ends_at` passes

---

### New: `bonds`

One row per person a user tracks. Always manual (name + birth_date). Optional link to a registered user for future use.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `owner_user_id` | UUID FK | FK profiles(user_id) |
| `name` | TEXT NOT NULL | |
| `birth_date` | DATE NOT NULL | |
| `life_path_number` | INT NOT NULL | Calculated on creation |
| `expression_number` | INT | |
| `soul_urge_number` | INT | |
| `personality_number` | INT | |
| `archetype` | TEXT | |
| `relationship_type` | TEXT | 'ally' \| 'complementary' \| 'tense' \| 'neutral' |
| `linked_user_id` | UUID FK nullable | FK profiles(user_id) — future use |
| `notes` | TEXT | |
| `created_at` | TIMESTAMPTZ DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ DEFAULT now() | |

---

### New: `teams`

A named group owned by a Pro user. Up to 5 members enforced at app level.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `owner_user_id` | UUID FK | FK profiles(user_id) |
| `name` | TEXT NOT NULL | |
| `analysis` | TEXT | AI-generated, updated on demand |
| `created_at` | TIMESTAMPTZ DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ DEFAULT now() | |

---

### New: `team_members`

Links bonds into a team. Replaces the JSON blob in `team_readings`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `team_id` | UUID FK | FK teams(id) ON DELETE CASCADE |
| `bond_id` | UUID FK | FK bonds(id) ON DELETE CASCADE |
| `added_at` | TIMESTAMPTZ DEFAULT now() | |
| | UNIQUE(team_id, bond_id) | |

---

### New: `streak_logs`

One row per user per action per day. Drives XP awards, streak calculation, and churn triggers.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK | FK profiles(user_id) |
| `logged_date` | DATE NOT NULL | |
| `action_type` | TEXT NOT NULL | 'pulse' \| 'journal' \| 'bond' \| 'mission' |
| `xp_earned` | INT DEFAULT 0 | |
| `created_at` | TIMESTAMPTZ DEFAULT now() | |
| | UNIQUE(user_id, logged_date, action_type) | Prevents duplicate daily entries |

---

### New: `notifications`

Delivery history. Used to enforce max 2 notifications/day before sending.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK | FK profiles(user_id) |
| `type` | TEXT NOT NULL | 'pulse' \| 'bond_alert' \| 'streak' \| 'trial_expiring' \| 'winback' |
| `channel` | TEXT NOT NULL | 'push' \| 'email' \| 'whatsapp' |
| `title` | TEXT | |
| `body` | TEXT | |
| `sent_at` | TIMESTAMPTZ DEFAULT now() | |
| `read_at` | TIMESTAMPTZ | NULL until opened |

---

### Rebuilt: `readings`

Removes duplicate `reading_type` column. Adds `personal_day` and `vibration` for pulse accuracy.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK | FK profiles(user_id) |
| `type` | TEXT NOT NULL | 'pulse' \| 'deep_dive' \| 'annual' |
| `title` | TEXT NOT NULL | |
| `content` | TEXT | |
| `ai_response` | TEXT | |
| `personal_year` | INT | |
| `personal_month` | INT | |
| `personal_day` | INT | New — for daily pulse accuracy |
| `vibration` | INT | New — day vibration (1–9) |
| `audio_url` | TEXT | |
| `is_read` | BOOLEAN DEFAULT false | |
| `scheduled_for` | TIMESTAMPTZ | |
| `metadata` | JSONB | |
| `created_at` | TIMESTAMPTZ DEFAULT now() | |

**Removed:** `reading_type` (duplicate of `type`)

---

### Renamed: `diary_entries` (was `journal_entries`)

Same structure. One field rename: `personal_number_at_entry` → `vibration_at_entry`.

---

### Unchanged Tables

No migration needed for these 11 tables:
`coach_sessions`, `coach_messages`, `user_stats`, `missions`, `user_missions`, `sync_logs`, `system_prompts`, `app_config`, `admin_health_checks`, `friction_diagnostics`, `payment_intents`

---

### Dropped: `team_readings`

Replaced by `bonds` + `teams` + `team_members`.

---

## Change Summary

| Action | Tables |
|--------|--------|
| Rebuilt | `profiles`, `readings` |
| New | `subscriptions`, `bonds`, `teams`, `team_members`, `streak_logs`, `notifications` |
| Renamed | `journal_entries` → `diary_entries` |
| Dropped | `team_readings` |
| Unchanged | `coach_sessions`, `coach_messages`, `user_stats`, `missions`, `user_missions`, `sync_logs`, `system_prompts`, `app_config`, `admin_health_checks`, `friction_diagnostics`, `payment_intents` |

---

## RLS Policy Principles

- All tables: users can only read/write their own rows (`user_id = auth.uid()`)
- `missions`: public read, no user writes
- `app_config`, `system_prompts`, `admin_health_checks`: admin-only read/write
- `team_members`: owner of the team can read/write
- `bonds`: owner can read/write their own bonds; `linked_user_id` target can read (future)

---

## Migration Strategy

1. Create all new tables alongside existing ones
2. Migrate data: `profiles` → new `profiles` (map `user_id`, drop old `id`), `profiles` subscription fields → `subscriptions` (all existing users get `plan = 'trial'`, `trial_ends_at = created_at + 30 days`), `journal_entries` → `diary_entries`, `team_readings` → `bonds` + `teams` + `team_members`
3. Update FK references in application code — note: `payment_intents.user_id` currently references `profiles(id)`; update to reference `profiles(user_id)` after the profiles rebuild
4. Drop old tables after verification
5. Regenerate TypeScript types via Supabase CLI
