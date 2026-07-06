import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  FileText,
  Network,
  Wand2,
  FileEdit,
  Layers,
  Clock,
  Gauge,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { useAISettings } from '@/hooks/useAISettings';
import { estimateCost, formatCost } from '@/lib/ai/tokens';
import { ProviderId } from '@/lib/ai/types';

interface ExecutiveDashboardProps {
  onNewProject: () => void;
  onGoToProjects: () => void;
}

export function ExecutiveDashboard({ onNewProject, onGoToProjects }: ExecutiveDashboardProps) {
  const navigate = useNavigate();
  const { data: recents = [], isLoading } = useRecentActivity(4);
  const { settings } = useAISettings();

  const quickActions = [
    { label: 'New Project', icon: FolderPlus, onClick: onNewProject, accent: 'primary' as const },
    { label: 'Draft Doc', icon: FileEdit, onClick: onGoToProjects },
    { label: 'Design Canvas', icon: Network, onClick: onGoToProjects },
    { label: 'Vibe Prompt', icon: Wand2, onClick: onGoToProjects },
  ];

  const openRecent = (projectId: string | null) => {
    if (projectId) navigate(`/projects/${projectId}`);
    else onGoToProjects();
  };

  // Usage widget: derive a simple projection from configured primary provider
  const primary = (settings.primaryProvider ?? 'lovable') as ProviderId;
  const model =
    settings.providers?.[primary]?.model ??
    (primary === 'lovable' ? 'google/gemini-2.5-flash' : 'default');
  const sampleIn = 8000;
  const sampleOut = 2000;
  const perRequest = estimateCost(primary, model, sampleIn, sampleOut);
  const monthly = { amount: perRequest.amount * 200, unit: perRequest.unit };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your workspace at a glance.
        </p>
      </div>

      {/* Quick Actions */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={action.onClick}
              className={cn(
                'group flex flex-col items-start gap-3 p-4 rounded-2xl border transition-all text-left',
                'bg-card/40 border-border/50 hover:border-primary/40 hover:bg-card/70',
                action.accent === 'primary' &&
                  'border-primary/30 bg-primary/5 hover:bg-primary/10'
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center border',
                  action.accent === 'primary'
                    ? 'bg-primary/15 border-primary/30 text-primary'
                    : 'bg-muted/40 border-border/50 text-foreground/80 group-hover:text-primary'
                )}
              >
                <action.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Recent Activity + Usage Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5 bg-card/40 border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onGoToProjects} className="text-xs">
              View all <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : recents.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No recent files yet. Create a project to get started.
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {recents.map((item) => {
                const Icon = item.kind === 'document' ? FileText : Layers;
                return (
                  <li key={`${item.kind}-${item.id}`}>
                    <button
                      onClick={() => openRecent(item.project_id)}
                      className="w-full flex items-center gap-3 py-3 hover:bg-accent/30 rounded-lg px-2 -mx-2 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-center text-primary/80">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.kind === 'document' ? 'Document' : 'Canvas'} ·{' '}
                          {new Date(item.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground/50" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Usage Widget */}
        <Card className="p-5 bg-gradient-to-br from-amber-500/10 via-card/60 to-card/40 border-amber-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-foreground">API Usage</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Active provider
              </div>
              <div className="text-base font-semibold text-foreground mt-0.5 capitalize">
                {primary}
              </div>
              <div className="text-xs text-muted-foreground truncate">{model}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background/40 border border-border/50">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Per request
                </div>
                <div className="text-sm font-semibold text-foreground mt-1">
                  {formatCost(perRequest)}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {sampleIn.toLocaleString()} in / {sampleOut.toLocaleString()} out
                </div>
              </div>
              <div className="p-3 rounded-lg bg-background/40 border border-border/50">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  ~200/mo
                </div>
                <div className="text-sm font-semibold text-amber-300 mt-1">
                  {formatCost(monthly)}
                </div>
                <div className="text-[10px] text-muted-foreground">Projected spend</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
              onClick={() => navigate('/settings')}
            >
              Manage keys
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
