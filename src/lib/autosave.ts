import { useCallback, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  delay?: number;
  onSave: (content: string) => Promise<void>;
}

export function useAutoSave({ delay = 1500, onSave }: UseAutoSaveOptions) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>('');

  const triggerSave = useCallback(
    async (content: string) => {
      // Clear any pending save
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Skip if content hasn't changed
      if (content === lastContentRef.current) {
        return;
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          setStatus('saving');
          await onSave(content);
          lastContentRef.current = content;
          setStatus('saved');
          
          // Reset to idle after showing "saved" for a moment
          setTimeout(() => setStatus('idle'), 2000);
        } catch (error) {
          console.error('Auto-save failed:', error);
          setStatus('error');
        }
      }, delay);
    },
    [delay, onSave]
  );

  const cancelSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { status, triggerSave, cancelSave };
}
