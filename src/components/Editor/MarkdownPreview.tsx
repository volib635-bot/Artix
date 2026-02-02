import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <ScrollArea className="h-full bg-editor-preview">
      <div className="p-6 prose prose-invert prose-amber max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content || '*Start typing to see preview...*'}
        </ReactMarkdown>
      </div>
    </ScrollArea>
  );
}
