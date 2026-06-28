import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AgenticWorkflow {
  id: string;
  user_id: string;
  project_id: string;
  source_document_id: string | null;
  pattern: string;
  agent_count: number;
  output_markdown: string;
  created_at: string;
}

export function useAgenticWorkflows(projectId: string | undefined) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['agentic_workflows', projectId],
    queryFn: async () => {
      if (!user || !projectId) return [];
      const { data, error } = await supabase
        .from('agentic_workflows' as any)
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as AgenticWorkflow[];
    },
    enabled: !!user && !!projectId,
  });

  const create = useMutation({
    mutationFn: async (input: {
      pattern: string;
      agent_count: number;
      output_markdown: string;
      source_document_id?: string | null;
    }) => {
      if (!user || !projectId) throw new Error('Missing user/project');
      const { data, error } = await (supabase.from('agentic_workflows' as any) as any)
        .insert({
          user_id: user.id,
          project_id: projectId,
          pattern: input.pattern,
          agent_count: input.agent_count,
          output_markdown: input.output_markdown,
          source_document_id: input.source_document_id ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AgenticWorkflow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agentic_workflows', projectId] });
    },
  });

  return {
    workflows,
    isLoading,
    createWorkflow: create.mutateAsync,
  };
}
