import { useState } from 'react';
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
  Folder,
  Zap,
  Clock,
  FolderKanban,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { ProjectCard } from './ProjectCard';
import { Project } from '@/hooks/useProjects';
import { ProjectPickerDialog } from './ProjectPickerDialog';

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

  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<'document' | 'design' | 'vibe' | null>(null);

  const handleQuickActionClick = (action: 'document' | 'design' | 'vibe') => {
    if (projects.length === 0) {
      onNewProject();
      return;
    }
    setActiveAction(action);
    setPickerOpen(true);
  };

  const handleSelectProjectForAction = (projectId: string) => {
    setPickerOpen(false);
    if (activeAction === 'document') {
      navigate(`/projects/${projectId}?action=new-document`);
    } else if (activeAction === 'design') {
      navigate(`/projects/${projectId}?action=new-design`);
    } else if (activeAction === 'vibe') {
      navigate(`/projects/${projectId}?action=new-vibe`);
    }
  };

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
      onClick: () => handleQuickActionClick('document'),
      tint: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
    },
    {
      label: 'Design Canvas',
      icon: Palette,
      onClick: () => handleQuickActionClick('design'),
      tint: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/20',
    },
    {
      label: 'Vibe Prompt',
      icon: Sparkles,
      onClick: () => handleQuickActionClick('vibe'),
      tint: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
    },
  ];

  const openRecent = (projectId: string | null) => {
    if (projectId) navigate(`/projects/${projectId}`);
    else onGoToProjects();
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Your workspace at a glance.</p>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="rounded-2xl border border-border/40 bg-card/25 p-6 space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
            <p className="text-xs text-muted-foreground">
              Start a new project or create documents and canvases directly
            </p>
          </div>
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
                'bg-card/50 border-border/60 hover:border-primary/40 hover:bg-card/85 hover:-translate-y-0.5'
              )}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105',
                  action.tint
                )}
              >
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Two column layout for Recents and Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Card - 1 Column */}
        <div className="lg:col-span-1 rounded-2xl border border-border/40 bg-card/25 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
                <p className="text-xs text-muted-foreground">Your recent edits</p>
              </div>
            </div>
            {recents.length > 0 && (
              <button
                onClick={onGoToProjects}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View all
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted/10 animate-pulse" />
                ))}
              </div>
            ) : recents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-0.5">No activity yet</h4>
                <p className="text-xs text-muted-foreground max-w-[200px] mb-4">
                  Documents and system designs will appear here as you edit them.
                </p>
                <Button onClick={onNewProject} size="sm" className="h-8 text-xs gap-1">
                  <Plus className="h-3.5 w-3.5" /> Start Project
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recents.map((item) => {
                  const isDoc = item.kind === 'document';
                  const Icon = isDoc ? FileText : Palette;
                  const themeClasses = isDoc 
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' 
                    : 'bg-purple-500/10 border-purple-500/20 text-purple-300';
                  return (
                    <button
                      key={`${item.kind}-${item.id}`}
                      onClick={() => openRecent(item.project_id)}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-card/40 border border-border/50 hover:border-primary/30 hover:bg-card/75 transition-all text-left group"
                    >
                      <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center shrink-0", themeClasses)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {isDoc ? 'Document' : 'Canvas'} · {new Date(item.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Your Projects Card - 2 Columns */}
        <div className="lg:col-span-2 rounded-2xl border border-border/40 bg-card/25 p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FolderKanban className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Your Projects</h3>
                <p className="text-xs text-muted-foreground">
                  Manage and view your {projects.length} workspace {projects.length === 1 ? 'project' : 'projects'}
                </p>
              </div>
            </div>
            {projects.length > 0 && (
              <button
                onClick={onGoToProjects}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View all
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {projects.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Folder className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-0.5">No projects yet</h4>
                <p className="text-xs text-muted-foreground mb-4 max-w-xs">
                  Create your first project to start organizing documents and designs.
                </p>
                <Button onClick={onNewProject} className="gap-1.5 h-9 text-xs">
                  <FolderPlus className="h-4 w-4" /> Create Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.slice(0, 4).map((project, index) => (
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
          </div>
        </div>
      </div>

      {/* Project Picker Dialog */}
      <ProjectPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        projects={projects}
        actionType={activeAction}
        onSelectProject={handleSelectProjectForAction}
        onCreateProject={onNewProject}
      />
    </div>
  );
}
