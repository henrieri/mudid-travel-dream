import type React from 'react'

function processInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let remaining = text
  let keyIndex = 0

  while (remaining.length > 0) {
    // Check for inline code `code`
    const codeMatch = remaining.match(/^`([^`]+)`/)
    if (codeMatch) {
      parts.push(
        <code
          key={`code-${keyIndex++}`}
          className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-cyan-300 font-mono"
        >
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // Check for bold **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/)
    if (boldMatch) {
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-white">
          {boldMatch[1]}
        </strong>
      )
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // Check for links [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      parts.push(
        <a
          key={`link-${keyIndex++}`}
          href={linkMatch[2]}
          className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
          target="_blank"
          rel="noreferrer"
        >
          {linkMatch[1]}
        </a>
      )
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    // Check for italic *text* or _text_
    const italicMatch = remaining.match(/^[*_]([^*_]+)[*_]/)
    if (italicMatch) {
      parts.push(
        <em key={`italic-${keyIndex++}`} className="italic text-slate-300">
          {italicMatch[1]}
        </em>
      )
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    // Regular text - find next special char or end
    const nextSpecial = remaining.search(/[`*_\[]/)
    if (nextSpecial === -1) {
      parts.push(remaining)
      break
    } else if (nextSpecial === 0) {
      // Special char that didn't match, treat as regular text
      parts.push(remaining[0])
      remaining = remaining.slice(1)
    } else {
      parts.push(remaining.slice(0, nextSpecial))
      remaining = remaining.slice(nextSpecial)
    }
  }

  return parts
}

function InlineMarkdown({ text }: { text: string }) {
  return <>{processInlineMarkdown(text)}</>
}

export function MarkdownBlock({ content }: { content: string }) {
  const lines = content.split('\n')
  const blocks: React.ReactNode[] = []
  let listItems: { text: string; checked?: boolean }[] = []
  let codeBlock: string[] = []
  let inCodeBlock = false

  const flushList = () => {
    if (listItems.length === 0) return
    blocks.push(
      <ul key={`list-${blocks.length}`} className="space-y-1.5 pl-4">
        {listItems.map((item, idx) => (
          <li key={`item-${idx}`} className="text-sm text-slate-300 flex items-start gap-2">
            {item.checked !== undefined ? (
              <span className={`mt-0.5 ${item.checked ? 'text-emerald-400' : 'text-slate-500'}`}>
                {item.checked ? '✓' : '○'}
              </span>
            ) : (
              <span className="text-slate-500 mt-0.5">•</span>
            )}
            <span className="flex-1">
              <InlineMarkdown text={item.text} />
            </span>
          </li>
        ))}
      </ul>
    )
    listItems = []
  }

  const flushCodeBlock = () => {
    if (codeBlock.length === 0) return
    blocks.push(
      <pre
        key={`codeblock-${blocks.length}`}
        className="rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-300 overflow-x-auto font-mono"
      >
        {codeBlock.join('\n')}
      </pre>
    )
    codeBlock = []
  }

  lines.forEach((line, lineIdx) => {
    // Code block handling
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock()
        inCodeBlock = false
      } else {
        flushList()
        inCodeBlock = true
      }
      return
    }

    if (inCodeBlock) {
      codeBlock.push(line)
      return
    }

    // Checkbox list items - [ ] or - [x]
    const checkboxMatch = line.match(/^-\s*\[([ xX])\]\s*(.*)$/)
    if (checkboxMatch) {
      listItems.push({
        text: checkboxMatch[2],
        checked: checkboxMatch[1].toLowerCase() === 'x',
      })
      return
    }

    // Regular list items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      listItems.push({ text: line.slice(2) })
      return
    }

    flushList()

    // Headers
    if (line.startsWith('### ')) {
      blocks.push(
        <h3
          key={`h3-${lineIdx}`}
          className="text-sm font-semibold text-white mt-4 mb-2"
        >
          <InlineMarkdown text={line.slice(4)} />
        </h3>
      )
      return
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h2
          key={`h2-${lineIdx}`}
          className="text-base font-semibold text-white mt-4 mb-2"
        >
          <InlineMarkdown text={line.slice(3)} />
        </h2>
      )
      return
    }

    if (line.startsWith('# ')) {
      blocks.push(
        <h1
          key={`h1-${lineIdx}`}
          className="text-lg font-semibold text-white mt-4 mb-2"
        >
          <InlineMarkdown text={line.slice(2)} />
        </h1>
      )
      return
    }

    // Horizontal rule
    if (line.match(/^[-*_]{3,}$/)) {
      blocks.push(
        <hr key={`hr-${lineIdx}`} className="border-white/10 my-4" />
      )
      return
    }

    // Empty line
    if (line.trim().length === 0) {
      blocks.push(<div key={`spacer-${lineIdx}`} className="h-2" />)
      return
    }

    // Regular paragraph
    blocks.push(
      <p key={`p-${lineIdx}`} className="text-sm text-slate-300 leading-relaxed">
        <InlineMarkdown text={line} />
      </p>
    )
  })

  flushList()
  flushCodeBlock()

  return <div className="space-y-2">{blocks}</div>
}
