-- Make user_id nullable in ai_token_usage to avoid failures if identity extraction is wonky
ALTER TABLE public.ai_token_usage ALTER COLUMN user_id DROP NOT NULL;
