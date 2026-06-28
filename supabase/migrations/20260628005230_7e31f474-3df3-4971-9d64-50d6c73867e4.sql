CREATE TABLE public.agentic_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  source_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  pattern text NOT NULL,
  agent_count int NOT NULL DEFAULT 3,
  output_markdown text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agentic_workflows TO authenticated;
GRANT ALL ON public.agentic_workflows TO service_role;
ALTER TABLE public.agentic_workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rows select" ON public.agentic_workflows FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own rows insert" ON public.agentic_workflows FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own rows delete" ON public.agentic_workflows FOR DELETE TO authenticated USING (auth.uid() = user_id);