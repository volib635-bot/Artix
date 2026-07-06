import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RecentItem {
  id: string;
  title: string;
  kind: 'document' | 'design';
  project_id: string | null;
  updated_at: string;
}

export function useRecentActivity(limit = 4) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-activity', user?.id, limit],
    queryFn: async (): Promise<RecentItem[]> => {
      if (!user) return [];

      const [docsRes, designsRes] = await Promise.all([
        supabase
          .from('documents')
          .select('id, title, project_id, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(limit),
        supabase
          .from('system_designs')
          .select('id, name, project_id, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(limit),
      ]);

      const items: RecentItem[] = [
        ...(docsRes.data ?? []).map((d) => ({
          id: d.id,
          title: d.title || 'Untitled Document',
          kind: 'document' as const,
          project_id: d.project_id,
          updated_at: d.updated_at,
        })),
        ...(designsRes.data ?? []).map((d) => ({
          id: d.id,
          title: d.name || 'Untitled Canvas',
          kind: 'design' as const,
          project_id: d.project_id,
          updated_at: d.updated_at,
        })),
      ];

      return items
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, limit);
    },
    enabled: !!user,
  });
}
