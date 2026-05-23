import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <div className="prose prose-invert max-w-3xl mx-auto
      prose-headings:font-serif prose-h1:text-accent prose-h1:text-3xl prose-h1:font-bold
      prose-h2:text-text-primary prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4
      prose-h3:text-text-primary prose-h3:text-xl prose-h3:font-semibold
      prose-p:text-text-secondary prose-p:leading-relaxed
      prose-a:text-accent prose-a:underline prose-a:decoration-accent/50 hover:prose-a:decoration-accent
      prose-strong:text-text-primary
      prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-bg-card prose-blockquote:rounded-r-lg prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:not-italic
      prose-blockquote:text-text-secondary
      prose-li:text-text-secondary prose-li:marker:text-text-muted
      prose-hr:border-border
      prose-img:rounded-lg prose-img:max-w-full
      prose-table:border-separate prose-table:border-spacing-0 prose-table:w-full prose-table:text-sm
      prose-thead:bg-bg-elevated
      prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2.5 prose-th:text-left prose-th:font-medium prose-th:text-text-primary
      prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2.5 prose-td:text-text-secondary
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          img: ({ ...props }) => (
            <img {...props} className="rounded-lg max-w-full" loading="lazy" />
          ),
          a: ({ ...props }) => (
            <a {...props} className="text-accent underline" target="_blank" rel="noopener noreferrer" />
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code className="rounded bg-bg-elevated px-1.5 py-0.5 text-sm text-text-secondary" {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-xl border border-border bg-bg-secondary p-4 text-sm">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
