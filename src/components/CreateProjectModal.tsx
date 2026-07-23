import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FolderPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => Promise<void>;
  isLoading?: boolean;
  existingNames?: string[];
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  existingNames = [],
}: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);

  // Reset state when modal is opened/closed
  useEffect(() => {
    setName('');
    setTouched(false);
  }, [open]);

  const isDuplicate = existingNames.some(
    (n) => n.trim().toLowerCase() === name.trim().toLowerCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!name.trim() || isDuplicate) return;
    
    await onSubmit(name.trim());
    onOpenChange(false);
  };

  const hasRequiredError = touched && !name.trim();
  const hasDuplicateError = name.trim().length > 0 && isDuplicate;
  const hasError = hasRequiredError || hasDuplicateError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/80">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <FolderPlus className="h-5 w-5 text-primary" />
              Create New Project
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Give your project a name. You can add documents and system designs inside.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <div className="flex justify-between items-baseline">
                <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Project Name <span className="text-destructive font-bold">*</span>
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {name.length}/50
                </span>
              </div>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  if (name.trim()) setTouched(true);
                }}
                placeholder="e.g. Acme System Specs"
                maxLength={50}
                required
                className={cn(
                  "h-10 bg-background border-border/60 focus-visible:ring-primary/45",
                  hasError && "border-destructive/80 focus-visible:ring-destructive/40 focus-visible:border-destructive"
                )}
                autoFocus
              />
              {hasRequiredError && (
                <p className="text-xs text-destructive font-medium mt-1 animate-pulse">
                  Project name is required.
                </p>
              )}
              {hasDuplicateError && (
                <p className="text-xs text-destructive font-medium mt-1">
                  A project with this name already exists.
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || isDuplicate || isLoading}
              className="h-10 shadow-md shadow-primary/10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
