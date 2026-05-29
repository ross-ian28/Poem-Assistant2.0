import { JSX } from "react"

interface Props {
    result: string
  }
  
  export default function ToolResult({ result }: Props) {
    const lines = result.split("\n")
    const elements: JSX.Element[] = []
    let i = 0
  
    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()
  
      // Blank line — spacer
      if (trimmed === "") {
        elements.push(<div key={i} className="h-2" />)
        i++
        continue
      }
  
      // Numbered line — pair it with the next non-empty line as inline content
      if (/^\d+\.$/.test(trimmed)) {
        const number = trimmed
  
        // Look ahead for the content line (skip any blank lines between)
        let contentIndex = i + 1
        while (contentIndex < lines.length && lines[contentIndex].trim() === "") {
          contentIndex++
        }
  
        const content = lines[contentIndex]?.trim() ?? ""
  
        elements.push(
          <div key={i} className="flex gap-3 mt-3">
            <span className="text-amber-400 font-semibold shrink-0 w-6">
              {number}
            </span>
            <p className="text-stone-300 leading-relaxed">{content}</p>
          </div>
        )
  
        // Skip past the number line and the content line
        i = contentIndex + 1
        continue
      }
  
      // Section label like "Example:" or "Note:"
      if (/^[A-Z][a-z]+:/.test(trimmed)) {
        elements.push(
          <p key={i} className="text-stone-400 font-medium mt-4">
            {trimmed}
          </p>
        )
        i++
        continue
      }
  
      // Default — plain prose
      elements.push(
        <p key={i} className="text-stone-300 leading-relaxed">
          {trimmed}
        </p>
      )
      i++
    }
  
    return (
      <div className="bg-stone-800 rounded-lg p-5 text-sm space-y-1">
        {elements}
      </div>
    )
  }