import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface VibeGeneration {
  id: string;
  user_id: string;
  project_id: string;
  source_document_id: string | null;
  target: string;
  scope: string;
  output_markdown: string;
  created_at: string;
}

export function useVibeGenerations(projectId: string | undefined) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: generations = [], isLoading } = useQuery({
    queryKey: ['vibe_generations', projectId],
    queryFn: async () => {
      if (!user || !projectId) return [];
      const { data, error } = await supabase
        .from('vibe_generations' as any)
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as VibeGeneration[];
    },
    enabled: !!user && !!projectId,
  });

  const create = useMutation({
    mutationFn: async (input: {
      target: string;
      scope: string;
      output_markdown: string;
      source_document_id?: string | null;
    }) => {
      if (!user || !projectId) throw new Error('Missing user/project');
      const { data, error } = await (supabase.from('vibe_generations' as any) as any)
        .insert({
          user_id: user.id,
          project_id: projectId,
          target: input.target,
          scope: input.scope,
          output_markdown: input.output_markdown,
          source_document_id: input.source_document_id ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as VibeGeneration;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vibe_generations', projectId] });
    },
  });

  return {
    generations,
    isLoading,
    createGeneration: create.mutateAsync,
  };
}
