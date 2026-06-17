CREATE TABLE public.prd_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  source_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  template text NOT NULL,
  output_markdown text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prd_generations TO authenticated;
GRANT ALL ON public.prd_generations TO service_role;
ALTER TABLE public.prd_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own PRDs" ON public.prd_generations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own PRDs" ON public.prd_generations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own PRDs" ON public.prd_generations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX prd_generations_project_idx ON public.prd_generations(project_id, created_at DESC);