import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <ScrollArea className="h-full bg-slate-950/80 border-l border-border/40">
      <div className="p-6 md:p-8 max-w-none text-slate-200 selection:bg-amber-500/30 selection:text-amber-200">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100 border-b border-slate-800 pb-2 mt-6 mb-4 font-sans tracking-tight">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl md:text-2xl font-semibold text-slate-100 border-b border-slate-800/60 pb-1 mt-5 mb-3 font-sans">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-amber-400 mt-4 mb-2 font-sans">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-sm md:text-base leading-relaxed text-slate-300 mb-4 font-sans">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 mb-4 text-slate-300 text-sm md:text-base pl-2">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 mb-4 text-slate-300 text-sm md:text-base pl-2">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-slate-300 leading-relaxed font-sans">{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-amber-500 bg-amber-500/10 pl-4 py-2 italic my-4 text-amber-200/90 rounded-r-md">
                {children}
              </blockquote>
            ),
            code: ({ className, children, ...props }) => {
              const isInline = !className && typeof children === 'string';
              if (isInline) {
                return (
                  <code className="bg-slate-900 border border-slate-800 text-amber-300 font-mono text-xs px-1.5 py-0.5 rounded" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <code className="block bg-slate-900 border border-slate-800/80 text-slate-100 font-mono text-xs md:text-sm p-4 rounded-lg overflow-x-auto my-4 shadow-inner" {...props}>
                  {children}
                </code>
              );
            },
            table: ({ children }) => (
              <div className="overflow-x-auto my-4 rounded-lg border border-slate-800">
                <table className="w-full text-left text-sm text-slate-300 border-collapse">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="bg-slate-900 px-4 py-2 border-b border-slate-800 font-semibold text-slate-200">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2 border-b border-slate-800/50">
                {children}
              </td>
            ),
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 underline underline-offset-4 font-medium transition-colors">
                {children}
              </a>
            ),
          }}
        >
          {content || '*Start typing to see markdown preview...*'}
        </ReactMarkdown>
      </div>
    </ScrollArea>
  );
}
