-- Migration: Add missing FK constraints to projects and system_designs
-- Ensures DB-level referential integrity and cascade deletion on user deletion

/*
  ==============================================================================
  ADMINISTRATIVE PRE-FLIGHT CHECK (Run in Supabase SQL Editor before applying)
  ==============================================================================
  
  To verify if any orphan records exist prior to applying constraints:

    SELECT * FROM public.system_designs WHERE user_id NOT IN (SELECT id FROM auth.users);
    SELECT * FROM public.projects WHERE user_id NOT IN (SELECT id FROM auth.users);

  ==============================================================================
*/

-- 1. Pre-flight cleanup: remove any orphan records referencing non-existent users
DELETE FROM public.system_designs WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.projects WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 2. Add Foreign Key constraints with CASCADE DELETE to projects (idempotent guard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_user_id_fkey'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Add Foreign Key constraints with CASCADE DELETE to system_designs (idempotent guard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'system_designs_user_id_fkey'
  ) THEN
    ALTER TABLE public.system_designs
      ADD CONSTRAINT system_designs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
