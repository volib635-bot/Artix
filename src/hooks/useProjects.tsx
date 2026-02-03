import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  document_count?: number;
  design_count?: number;
}

export function useProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (projectsError) throw projectsError;
      
      // Fetch document counts per project
      const { data: docCounts } = await supabase
        .from('documents')
        .select('project_id')
        .eq('user_id', user.id)
        .not('project_id', 'is', null);
      
      // Fetch system design counts per project
      const { data: designCounts } = await supabase
        .from('system_designs')
        .select('project_id')
        .eq('user_id', user.id);
      
      // Count documents and designs per project
      const docCountMap: Record<string, number> = {};
      const designCountMap: Record<string, number> = {};
      
      docCounts?.forEach((doc) => {
        if (doc.project_id) {
          docCountMap[doc.project_id] = (docCountMap[doc.project_id] || 0) + 1;
        }
      });
      
      designCounts?.forEach((design) => {
        designCountMap[design.project_id] = (designCountMap[design.project_id] || 0) + 1;
      });
      
      return projectsData.map((project) => ({
        ...project,
        document_count: docCountMap[project.id] || 0,
        design_count: designCountMap[project.id] || 0,
      })) as Project[];
    },
    enabled: !!user,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('projects')
        .insert({ user_id: user.id, name })
        .select()
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects,
    isLoading,
    createProject: createProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
  };
}
