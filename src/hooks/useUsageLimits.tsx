/**
 * useUsageLimits.tsx
 * ──────────────────
 * React hook that counts the user's current usage and compares it
 * against their plan's limits.
 *
 * Returns per-resource usage objects with `used`, `limit`, and `canCreate`.
 * The hook queries actual row counts from Supabase tables.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';
import { PLAN_LIMITS, isWithinLimit } from '@/lib/plans';

interface UsageInfo {
  used: number;
  limit: number | null;
  canCreate: boolean;
}

export interface UsageLimits {
  projects: UsageInfo;
  documents: UsageInfo;
  systemDesigns: UsageInfo;
  aiGenerations: UsageInfo;
  isLoading: boolean;
}

export function useUsageLimits(): UsageLimits {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const plan = subscription?.plan && (subscription.plan in PLAN_LIMITS) ? subscription.plan : 'free';
  const limits = PLAN_LIMITS[plan];

  const query = useQuery({
    queryKey: ['usage-counts', user?.id, subscription.plan],
    queryFn: async () => {
      if (!user) return { projects: 0, documents: 0, systemDesigns: 0, aiGenerations: 0 };

      // Count projects
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count documents (across all projects)
      const { count: docCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count system designs (across all projects)
      const { count: designCount } = await supabase
        .from('system_designs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count AI generations this month (sum of all 4 AI tables)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const monthStart = startOfMonth.toISOString();

      const [prdResult, vibeResult, agenticResult] = await Promise.all([
        supabase
          .from('prd_generations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', monthStart),
        supabase
          .from('vibe_generations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', monthStart),
        supabase
          .from('agentic_workflows')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', monthStart),
      ]);

      const aiTotal =
        (prdResult.count ?? 0) +
        (vibeResult.count ?? 0) +
        (agenticResult.count ?? 0);

      return {
        projects: projectCount ?? 0,
        documents: docCount ?? 0,
        systemDesigns: designCount ?? 0,
        aiGenerations: aiTotal,
      };
    },
    enabled: !!user,
    staleTime: 30_000, // Refresh every 30 seconds
  });

  const counts = query.data ?? { projects: 0, documents: 0, systemDesigns: 0, aiGenerations: 0 };

  return {
    projects: {
      used: counts.projects,
      limit: limits.projects,
      canCreate: isWithinLimit(counts.projects, limits.projects),
    },
    documents: {
      used: counts.documents,
      limit: limits.documents,
      canCreate: isWithinLimit(counts.documents, limits.documents),
    },
    systemDesigns: {
      used: counts.systemDesigns,
      limit: limits.systemDesigns,
      canCreate: isWithinLimit(counts.systemDesigns, limits.systemDesigns),
    },
    aiGenerations: {
      used: counts.aiGenerations,
      limit: limits.aiGenerationsPerMonth,
      canCreate: isWithinLimit(counts.aiGenerations, limits.aiGenerationsPerMonth),
    },
    isLoading: query.isLoading,
  };
}
