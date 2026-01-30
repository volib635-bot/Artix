import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DocumentFormat, formatOptions, languageMap } from './languageMap';
import { SaveStatus } from '@/lib/autosave';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Download, 
  FileText, 
  Check, 
  Loader2, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  title: string;
  format: DocumentFormat;
  saveStatus: SaveStatus;
  onFormatChange: (format: DocumentFormat) => void;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onBack: () => void;
}

const SaveIndicator = ({ status }: { status: SaveStatus }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md",
          status === 'saving' && "text-muted-foreground",
          status === 'saved' && "text-success",
          status === 'error' && "text-destructive",
          status === 'idle' && "text-muted-foreground/50"
        )}
      >
        {status === 'saving' && (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Saving...</span>
          </>
        )}
        {status === 'saved' && (
          <>
            <Check className="h-3 w-3" />
            <span>Saved</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="h-3 w-3" />
            <span>Error</span>
          </>
        )}
        {status === 'idle' && (
          <span className="text-muted-foreground/40">Auto-save enabled</span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export function EditorToolbar({
  title,
  format,
  saveStatus,
  onFormatChange,
  onTitleChange,
  onSave,
  onBack,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between h-14 px-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-transparent border-none text-foreground font-medium text-sm focus:outline-none focus:ring-0 w-48 truncate"
            placeholder="Untitled Document"
          />
        </div>

        <Select value={format} onValueChange={(value) => onFormatChange(value as DocumentFormat)}>
          <SelectTrigger className="w-32 h-8 text-xs bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {formatOptions.map((f) => (
              <SelectItem key={f} value={f}>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-primary">{languageMap[f].icon}</span>
                  {languageMap[f].label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <SaveIndicator status={saveStatus} />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className="text-muted-foreground hover:text-foreground"
        >
          <Save className="h-4 w-4 mr-1.5" />
          Save
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Export
        </Button>
      </div>
    </div>
  );
}
