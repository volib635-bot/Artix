import { useState } from 'react';
import { Project } from '@/hooks/useProjects';
import { Folder, Search, Plus, Calendar, FileText, GitBranch, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface ProjectPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  actionType: 'document' | 'design' | 'vibe' | null;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
}

export function ProjectPickerDialog({
  open,
  onOpenChange,
  projects,
  actionType,
  onSelectProject,
  onCreateProject,
}: ProjectPickerDialogProps) {
  const [search, setSearch] = useState('');

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const getActionLabel = () => {
    switch (actionType) {
      case 'document':
        return 'create a New Document';
      case 'design':
        return 'create a New System Design';
      case 'vibe':
        return 'start Vibe Coding';
      default:
        return 'continue';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-border/80">
        <DialogHeader className="p-6 pb-4 border-b border-border/40">
          <DialogTitle className="text-xl font-bold text-foreground">
            Select a Project
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Choose a project to {getActionLabel()} in.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 border-b border-border/30 bg-background/30 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="pl-9 h-10 bg-background/50 border-border/60 focus-visible:ring-primary/45"
            />
          </div>
          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onCreateProject();
            }}
            className="h-10 gap-1.5 px-3 shrink-0 rounded-lg shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New</span>
          </Button>
        </div>

        <ScrollArea className="max-h-[300px] min-h-[150px]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {search ? 'No matching projects found.' : 'No projects available. Create one first!'}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filtered.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent/40 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors shrink-0">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-blue-400/80" />
                        {project.document_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3 text-purple-400/80" />
                        {project.design_count || 0}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
