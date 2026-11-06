import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
export interface MarkdownProps {
  children: string
  className?: string
}
/** 不启用raw HTML插件，保留react-markdown默认URL过滤。 */
export function Markdown({ children, className = '' }: MarkdownProps) {
  return (
    <div className={`bui-markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a: ({ node, ...props }) => <a {...props} rel="noopener noreferrer" />,
          table: ({ node, ...props }) => (
            <div className="bui-markdown__table">
              <table {...props} />
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
