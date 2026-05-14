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
      "prose prose-slate dark:prose-invert max-w-none transition-all duration-200",
      "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground",
      "prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-6 prose-h1:pb-2 prose-h1:border-b",
      "prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-1 prose-h2:border-b/50",
      "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3",
      "prose-p:text-base prose-p:leading-7 prose-p:mb-5 prose-p:text-muted-foreground/90 dark:prose-p:text-slate-300",
      "prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:decoration-primary/30 hover:prose-a:decoration-primary/100 transition-colors",
      "prose-strong:text-foreground prose-strong:font-bold",
      "prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6 prose-li:my-2",
      "prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-2",
      "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:my-8 prose-blockquote:text-muted-foreground",
      "prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-10 prose-img:mx-auto prose-img:border prose-img:border-border",
      "prose-hr:my-12 prose-hr:border-border/60",
      "prose-table:my-8 prose-table:border-collapse prose-table:w-full prose-table:overflow-hidden prose-table:rounded-xl prose-table:border prose-table:border-border",
      "prose-th:bg-muted prose-th:p-4 prose-th:text-left prose-th:font-bold prose-th:border prose-th:border-border",
      "prose-td:p-4 prose-td:border prose-td:border-border prose-td:align-top",
      "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-medium prose-code:before:content-none prose-code:after:content-none",
      "prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none",
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ className, ...props }) => <h1 className={cn("text-3xl md:text-4xl", className)} {...props} />,
          h2: ({ className, ...props }) => <h2 className={cn("text-2xl md:text-3xl", className)} {...props} />,
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
          code({ inline, className, children, ...props }: any) {
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
