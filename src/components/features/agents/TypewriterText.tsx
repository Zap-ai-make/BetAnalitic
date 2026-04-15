"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { cn } from "~/lib/utils"

interface TypewriterTextProps {
  text: string
  speed?: number // ms per character (default: 30)
  isComplete?: boolean
  showCursor?: boolean
  className?: string
  renderCitation?: (citationNumber: number) => React.ReactNode
}

// Shared markdown components config
const createMarkdownComponents = (cnFn: typeof cn) => ({
  code({
    inline,
    className,
    children,
    ...props
  }: {
    inline?: boolean
    className?: string
    children?: React.ReactNode
  }) {
    const match = /language-(\w+)/.exec(className ?? "")
    return !inline && match ? (
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code
        className={cnFn(
          "bg-bg-tertiary px-1.5 py-0.5 rounded text-sm font-mono",
          className
        )}
        {...props}
      >
        {children}
      </code>
    )
  },
  a({ children, href }: { children?: React.ReactNode; href?: string }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-cyan hover:underline"
      >
        {children}
      </a>
    )
  },
  h1({ children }: { children?: React.ReactNode }) {
    return (
      <h1 className="text-2xl font-display font-bold text-text-primary mt-6 mb-4">
        {children}
      </h1>
    )
  },
  h2({ children }: { children?: React.ReactNode }) {
    return (
      <h2 className="text-xl font-display font-bold text-text-primary mt-5 mb-3">
        {children}
      </h2>
    )
  },
  h3({ children }: { children?: React.ReactNode }) {
    return (
      <h3 className="text-lg font-display font-semibold text-text-primary mt-4 mb-2">
        {children}
      </h3>
    )
  },
  ul({ children }: { children?: React.ReactNode }) {
    return <ul className="list-disc list-inside space-y-1 my-3">{children}</ul>
  },
  ol({ children }: { children?: React.ReactNode }) {
    return <ol className="list-decimal list-inside space-y-1 my-3">{children}</ol>
  },
  p({ children }: { children?: React.ReactNode }) {
    return <p className="my-2 leading-relaxed">{children}</p>
  },
  blockquote({ children }: { children?: React.ReactNode }) {
    return (
      <blockquote className="border-l-4 border-accent-cyan pl-4 italic my-3 text-text-secondary">
        {children}
      </blockquote>
    )
  },
  table({ children }: { children?: React.ReactNode }) {
    return (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full border border-bg-tertiary">{children}</table>
      </div>
    )
  },
  th({ children }: { children?: React.ReactNode }) {
    return (
      <th className="border border-bg-tertiary px-3 py-2 bg-bg-tertiary text-left font-semibold">
        {children}
      </th>
    )
  },
  td({ children }: { children?: React.ReactNode }) {
    return <td className="border border-bg-tertiary px-3 py-2">{children}</td>
  },
})

export function TypewriterText({
  text,
  speed = 30,
  isComplete = false,
  showCursor = true,
  className,
  renderCitation,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = React.useState("")
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Typewriter effect
  React.useEffect(() => {
    if (isComplete) {
      setDisplayedText(text)
      setCurrentIndex(text.length)
      return
    }

    if (currentIndex >= text.length) return

    const char = text[currentIndex]
    const isPunctuation = /[.!?]/.test(char ?? "")

    // Extra delay for punctuation
    const delay = isPunctuation ? speed + 100 : speed

    const timer = setTimeout(() => {
      setDisplayedText(text.substring(0, currentIndex + 1))
      setCurrentIndex((prev) => prev + 1)
    }, delay)

    return () => clearTimeout(timer)
  }, [text, currentIndex, speed, isComplete])

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    }
  }, [displayedText])

  const showingCursor = showCursor && !isComplete
  const markdownComponents = React.useMemo(() => createMarkdownComponents(cn), [])

  // Process text to replace citations with components
  const processedText = React.useMemo(() => {
    if (!renderCitation) return null

    // Split text by citation pattern [1], [2], etc.
    const parts: Array<{ type: "text" | "citation"; content: string | number }> = []
    let lastIndex = 0

    const citationRegex = /\[(\d+)\]/g
    let match: RegExpExecArray | null

    while ((match = citationRegex.exec(displayedText)) !== null) {
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: displayedText.slice(lastIndex, match.index),
        })
      }

      // Add citation number
      parts.push({
        type: "citation",
        content: parseInt(match[1] ?? "0", 10),
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < displayedText.length) {
      parts.push({
        type: "text",
        content: displayedText.slice(lastIndex),
      })
    }

    return parts
  }, [displayedText, renderCitation])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {renderCitation && processedText ? (
        <div>
          {processedText.map((part, idx) =>
            part.type === "text" ? (
              <span key={idx}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {String(part.content)}
                </ReactMarkdown>
              </span>
            ) : (
              <span key={idx}>{renderCitation(part.content as number)}</span>
            )
          )}
          {showingCursor && (
            <span
              className="inline-block w-2 h-5 bg-accent-cyan ml-1 animate-pulse"
              aria-hidden="true"
            />
          )}
        </div>
      ) : (
        <>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {displayedText}
          </ReactMarkdown>

          {/* Blinking cursor */}
          {showingCursor && (
            <span
              className="inline-block w-2 h-5 bg-accent-cyan ml-1 animate-pulse"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </div>
  )
}
