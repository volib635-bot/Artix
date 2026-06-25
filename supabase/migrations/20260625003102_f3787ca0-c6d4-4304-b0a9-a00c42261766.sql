CREATE TABLE public.vibe_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  source_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  target text NOT NULL,
  scope text NOT NULL,
  output_markdown text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vibe_generations TO authenticated;
GRANT ALL ON public.vibe_generations TO service_role;
ALTER TABLE public.vibe_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rows select" ON public.vibe_generations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own rows insert" ON public.vibe_generations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own rows delete" ON public.vibe_generations FOR DELETE TO authenticated USING (auth.uid() = user_id);