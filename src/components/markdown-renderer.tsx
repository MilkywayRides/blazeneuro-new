"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Copy, Check, ExternalLink } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className={cn(
      "prose prose-slate dark:prose-invert max-w-none transition-all duration-300",
      "prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-foreground/90",
      "prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:mt-12 prose-h1:mb-8 prose-h1:pb-4 prose-h1:border-b-2 prose-h1:border-primary/10",
      "prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/50",
      "prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4",
      "prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6 prose-p:text-foreground/80 dark:prose-p:text-slate-300/90",
      "prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:decoration-2 prose-a:underline-offset-4 transition-all",
      "prose-strong:text-foreground prose-strong:font-bold prose-strong:bg-primary/5 dark:prose-strong:bg-primary/10 prose-strong:px-1 prose-strong:rounded",
      "prose-ul:my-8 prose-ul:list-none prose-ul:pl-0",
      "prose-ol:my-8 prose-ol:list-decimal prose-ol:pl-6 prose-ol:marker:text-primary prose-ol:marker:font-bold",
      "prose-li:relative prose-li:pl-7 prose-li:my-3 prose-li:leading-relaxed",
      "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 dark:prose-blockquote:bg-primary/10 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:my-10 prose-blockquote:text-foreground/90 prose-blockquote:shadow-sm",
      "prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-12 prose-img:mx-auto prose-img:border-4 prose-img:border-background prose-img:ring-1 prose-img:ring-border",
      "prose-hr:my-16 prose-hr:border-border/40",
      "prose-table:my-10 prose-table:border-hidden prose-table:w-full prose-table:rounded-2xl prose-table:shadow-lg prose-table:ring-1 prose-table:ring-border",
      "prose-th:bg-muted/80 prose-th:p-5 prose-th:text-sm prose-th:uppercase prose-th:tracking-widest prose-th:font-black prose-th:border-b prose-th:border-border",
      "prose-td:p-5 prose-td:border-b prose-td:border-border/50 prose-td:text-sm prose-td:align-middle",
      "prose-code:bg-muted/50 prose-code:text-primary prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:text-sm prose-code:font-bold prose-code:before:content-none prose-code:after:content-none prose-code:border prose-code:border-border/50",
      "prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none prose-pre:shadow-none",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => <h1 className="flex items-center gap-3" {...props} />,
          h2: ({ ...props }) => <h2 className="flex items-center gap-2" {...props} />,
          li: ({ children, ...props }: React.ComponentPropsWithoutRef<'li'> & { node?: any }) => {
            const isOrdered = (props as any).node?.parent?.tagName === 'ol';
            if (isOrdered) return <li {...props}>{children}</li>;
            return (
              <li className="before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:h-2 before:w-2 before:rounded-full before:bg-primary/60" {...props}>
                {children}
              </li>
            );
          },
          a: ({ ...props }) => {
            const isExternal = props.href?.startsWith('http')
            return (
              <a 
                {...props} 
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-1"
              >
                {props.children}
                {isExternal && <ExternalLink className="w-3 h-3" />}
              </a>
            )
          },
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-8 rounded-xl border border-border">
              <table className={cn("w-full border-collapse", props.className)} {...props} />
            </div>
          ),
          code({ inline, className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
            const match = /language-(\w+)/.exec(className || "")
            const code = String(children).replace(/\n$/, "")
            const language = match ? match[1] : ""
            
            return !inline && match ? (
              <div className="relative group my-6 overflow-hidden rounded-xl border border-border bg-[#282c34] shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    {language}
                  </span>
                  <button
                    onClick={() => copyCode(code)}
                    className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 transition-all active:scale-95"
                    title="Copy code"
                  >
                    {copiedCode === code ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="p-0 overflow-auto max-h-[600px]">
                  <SyntaxHighlighter
                    style={oneDark}
                    language={language}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: "1.25rem",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                      background: "transparent",
                    }}
                    {...props}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <code className={cn("bg-muted/80 text-foreground px-1.5 py-0.5 rounded text-sm font-medium", className)} {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
