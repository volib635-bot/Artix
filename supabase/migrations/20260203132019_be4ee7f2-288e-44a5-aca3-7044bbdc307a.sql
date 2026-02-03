-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Project',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects
CREATE POLICY "Users can view their own projects"
ON public.projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON public.projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON public.projects FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at on projects
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create system_designs table for canvas board state
CREATE TABLE public.system_designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'System Design',
  board_state JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on system_designs
ALTER TABLE public.system_designs ENABLE ROW LEVEL SECURITY;

-- RLS policies for system_designs
CREATE POLICY "Users can view their own system designs"
ON public.system_designs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own system designs"
ON public.system_designs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own system designs"
ON public.system_designs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own system designs"
ON public.system_designs FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at on system_designs
CREATE TRIGGER update_system_designs_updated_at
BEFORE UPDATE ON public.system_designs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add project_id to documents table (nullable for backwards compatibility)
ALTER TABLE public.documents
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;