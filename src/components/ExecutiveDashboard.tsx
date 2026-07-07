import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  FileText,
  Palette,
  Sparkles,
  FileEdit,
  Layers,
  ArrowUpRight,
  Code2,
  Folder,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { useAISettings } from '@/hooks/useAISettings';
import { estimateCost, formatCost } from '@/lib/ai/tokens';
import { ProviderId } from '@/lib/ai/types';
import { ProjectCard } from './ProjectCard';
import { Project } from '@/hooks/useProjects';

interface ExecutiveDashboardProps {
  onNewProject: () => void;
  onGoToProjects: () => void;
  projects: Project[];
  onSelectProject: (p: Project) => void;
  onDeleteProject: (p: Project) => void;
  onRenameProject: (p: Project) => void;
}

export function ExecutiveDashboard({
  onNewProject,
  onGoToProjects,
  projects,
  onSelectProject,
  onDeleteProject,
  onRenameProject,
}: ExecutiveDashboardProps) {
  const navigate = useNavigate();
  const { data: recents = [], isLoading } = useRecentActivity(4);
  const { settings } = useAISettings();
  const apiRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    {
      label: 'New Project',
      icon: FolderPlus,
      onClick: onNewProject,
      tint: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
    },
    {
      label: 'Draft Doc',
      icon: FileEdit,
      onClick: onGoToProjects,
      tint: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
    },
    {
      label: 'Design Canvas',
      icon: Palette,
      onClick: onGoToProjects,
      tint: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/20',
    },
    {
      label: 'Vibe Prompt',
      icon: Sparkles,
      onClick: onGoToProjects,
      tint: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
    },
  ];

  const primary: ProviderId = settings.primary?.provider ?? 'lovable';
  const model =
    settings.primary?.model ?? (primary === 'lovable' ? 'google/gemini-2.5-flash' : 'default');
  const sampleIn = 8000;
  const sampleOut = 2000;
  const perRequest = estimateCost(primary, model, sampleIn, sampleOut);
  const monthly = { amount: perRequest.amount * 200, unit: perRequest.unit };

  const openRecent = (projectId: string | null) => {
    if (projectId) navigate(`/projects/${projectId}`);
    else onGoToProjects();
  };

  return (
    <div className="p-6 md:p-10 space-y-12 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Your workspace at a glance.</p>
        </div>
        <Button onClick={onNewProject} className="gap-2 rounded-lg shadow-lg shadow-primary/20">
          <FolderPlus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Quick Actions */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Start a new project or access your favorite tools
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={action.onClick}
              className={cn(
                'group flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border transition-all',
                'bg-card/50 border-border/60 hover:border-primary/40 hover:bg-card/80 hover:-translate-y-0.5'
              )}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center border',
                  action.tint
                )}
              >
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      <div className="h-px bg-border/60" />

      {/* Recent Activity */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your recent projects and documents
            </p>
          </div>
          <button
            onClick={onGoToProjects}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : recents.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground rounded-xl border border-border/50 bg-card/30">
            No recent files yet. Create a project to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {recents.map((item) => {
              const Icon = item.kind === 'document' ? FileText : Palette;
              return (
                <button
                  key={`${item.kind}-${item.id}`}
                  onClick={() => openRecent(item.project_id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/60 hover:border-primary/40 hover:bg-card/80 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.kind === 'document' ? 'Document' : 'Canvas'} ·{' '}
                      {new Date(item.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/60" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="h-px bg-border/60" />

      {/* API Usage — full width */}
      <section ref={apiRef} id="api-usage">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">API Usage</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor your active providers and usage metrics
          </p>
        </div>

        <div className="relative rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
          {/* Left amber accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600" />

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column */}
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-300">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Active Provider
                  </div>
                  <div className="text-base font-semibold text-foreground capitalize mt-0.5">
                    {primary}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Endpoint
                </div>
                <div className="px-3 py-2.5 rounded-lg bg-background/60 border border-border/60 editor-font text-sm text-foreground/90 truncate">
                  {model}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Per Request
                  </div>
                  <div className="text-xs font-medium text-foreground">
                    {sampleIn.toLocaleString()} in / {sampleOut.toLocaleString()} out
                  </div>
                </div>
                <div className="h-2 rounded-full bg-background/60 border border-border/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                    style={{ width: '80%' }}
                  />
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Projected Spend
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <div className="text-3xl font-bold text-amber-300">{formatCost(monthly)}</div>
                  <div className="text-xs text-muted-foreground">/mo · Based on current usage</div>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Per request: {formatCost(perRequest)}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <Button
              onClick={() => navigate('/settings')}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-500/90 hover:to-amber-600/90 text-amber-950 font-semibold shadow-lg shadow-amber-500/20"
            >
              Manage Keys
            </Button>
          </div>
        </div>
      </section>

      <div className="h-px bg-border/60" />

      {/* Your Projects */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Your Projects</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <button
            onClick={onGoToProjects}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="py-16 rounded-xl border border-border/60 bg-card/30 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Folder className="h-7 w-7 text-primary" />
            </div>
            <h4 className="text-base font-semibold text-foreground mb-1">No projects yet</h4>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Create your first project to start organizing your workspace.
            </p>
            <Button onClick={onNewProject} className="gap-2">
              <FolderPlus className="h-4 w-4" /> Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onClick={() => onSelectProject(project)}
                onDelete={() => onDeleteProject(project)}
                onRename={() => onRenameProject(project)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
