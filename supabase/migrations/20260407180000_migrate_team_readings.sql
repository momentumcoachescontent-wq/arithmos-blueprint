-- supabase/migrations/20260407180000_migrate_team_readings.sql
-- Migrate data from team_readings (JSON blob) into bonds + teams + team_members
-- In v2 schema, team_readings table may not exist, so this migration is safely conditional

DO $$
DECLARE
  tr RECORD;
  member JSONB;
  new_team_id UUID;
  new_bond_id UUID;
  life_path INT;
BEGIN
  -- Only run migration if team_readings table exists
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'team_readings'
  ) THEN
    FOR tr IN SELECT * FROM public.team_readings LOOP
      -- Create a team for each team_reading
      INSERT INTO public.teams (id, owner_user_id, name, analysis, created_at, updated_at)
      VALUES (gen_random_uuid(), tr.owner_id, tr.title, tr.analysis, tr.created_at, COALESCE(tr.updated_at, tr.created_at))
      RETURNING id INTO new_team_id;

      -- For each member in the JSON array, create a bond and link it to the team
      FOR member IN SELECT * FROM jsonb_array_elements(tr.members) LOOP
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

    -- Drop the old table only if it exists
    DROP TABLE public.team_readings;
  END IF;
END $$;
