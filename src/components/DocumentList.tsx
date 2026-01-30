import { motion } from 'framer-motion';
import { FileText, MoreVertical, Trash2, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Document } from './Editor/Editor';
import { languageMap, DocumentFormat } from './Editor/languageMap';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface DocumentListProps {
  documents: Document[];
  onSelect: (doc: Document) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const formatBadgeColors: Record<DocumentFormat, string> = {
  markdown: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  xml: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  text: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export function DocumentList({ documents, onSelect, onDelete, onCreate }: DocumentListProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Your Documents</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </p>
        </div>
        <Button onClick={onCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No documents yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-4">
            Create your first document to start writing in Markdown, XML, or plain text.
          </p>
          <Button onClick={onCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Document
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-3">
          {documents.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "group relative flex items-center gap-4 p-4 rounded-lg",
                "bg-card border border-border hover:border-primary/30",
                "transition-all duration-200 cursor-pointer",
                "hover:shadow-md hover:shadow-primary/5"
              )}
              onClick={() => onSelect(doc)}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <span className="font-mono text-sm text-primary font-bold">
                  {languageMap[doc.format].icon}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {doc.title || 'Untitled Document'}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                    formatBadgeColors[doc.format]
                  )}>
                    {languageMap[doc.format].label}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(doc.id);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
