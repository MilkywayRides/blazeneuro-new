"use client"

import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function MarkdownRenderer({ content }: { content: string }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success("Copied!")
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none 
      prose-p:mb-4 prose-p:leading-relaxed
      prose-headings:mb-4 prose-headings:mt-6
      prose-ul:my-4 prose-ul:space-y-2
      prose-ol:my-4 prose-ol:space-y-2
      prose-li:leading-relaxed
      prose-pre:my-4
      prose-blockquote:my-4">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "")
            const code = String(children).replace(/\n$/, "")
            
            return !inline && match ? (
              <div className="relative group">
                <button
                  onClick={() => copyCode(code)}
                  className="absolute right-2 top-2 p-2 rounded-md bg-muted hover:bg-muted/80 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  {copiedCode === code ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: "0.5rem",
                    padding: "1rem",
                  }}
                  {...props}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
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
