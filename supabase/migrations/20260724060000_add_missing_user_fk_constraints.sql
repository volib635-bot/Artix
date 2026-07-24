-- Migration: Add missing FK constraints to projects and system_designs
-- Ensures DB-level referential integrity and cascade deletion on user deletion

-- 1. Pre-flight cleanup: remove any orphan records referencing non-existent users
DELETE FROM public.system_designs WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.projects WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 2. Add Foreign Key constraints with CASCADE DELETE to projects
ALTER TABLE public.projects
  ADD CONSTRAINT projects_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Add Foreign Key constraints with CASCADE DELETE to system_designs
ALTER TABLE public.system_designs
  ADD CONSTRAINT system_designs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
