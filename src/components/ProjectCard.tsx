import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  Folder, 
  FileText, 
  GitBranch, 
  MoreVertical, 
  Trash2, 
  Pencil,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Project } from '@/hooks/useProjects';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete: () => void;
  onRename: () => void;
  index: number;
}

export function ProjectCard({ project, onClick, onDelete, onRename, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative p-5 rounded-xl cursor-pointer",
        "bg-card border border-border hover:border-primary/40",
        "transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/10",
        "hover:-translate-y-1"
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Folder className="h-6 w-6 text-primary" />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onRename();
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
        {project.name}
      </h3>

      {/* Date */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
        <Calendar className="h-3 w-3" />
        <span>Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-500/20">
            <FileText className="h-3 w-3 text-blue-400" />
          </div>
          <span className="text-muted-foreground">{project.document_count || 0}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-sm">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-purple-500/20">
            <GitBranch className="h-3 w-3 text-purple-400" />
          </div>
          <span className="text-muted-foreground">{project.design_count || 0}</span>
        </div>
      </div>
    </motion.div>
  );
}
