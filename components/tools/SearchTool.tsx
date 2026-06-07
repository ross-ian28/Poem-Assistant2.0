"use client"
import { useState } from "react"
import ToolResult from "@/components/ToolResult"
import StarButton from "@/components/StarButton"

const MAX_CHARS = 250

export default function SearchTool() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [historyId, setHistoryId] = useState<string | null>(null)

  const remaining = MAX_CHARS - input.length
  const isNearLimit = remaining <= 100

  const run = async () => {
    setError("")
    setHistoryId(null)
    const trimmed = input.trim()
  
    if (!trimmed) {
      setError("Please enter a word.")
      return
    }
  
    setLoading(true)
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "search", input: trimmed }),
      })
      const data = await res.json()
  
      if (res.status === 429) {
        setError(data.message)
        return
      }
  
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.")
        return
      }
  
      setResult(data.result)
      setHistoryId(data.historyId)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-mauve text-lg font-gothic">
        Ask anything — writing advice, literary history, word origins, general knowledge.
      </p>

      <div className="space-y-1">
        <textarea
          className="w-full bg-darkmaroon border border-parchment rounded-lg px-4 py-3 text-parchment font-gothic text-lg placeholder-mauve focus:outline-none focus:border-mauve transition-colors h-36 resize-none"
          placeholder="e.g. What is iambic pentameter? How did the sonnet form originate?"
          value={input}
          maxLength={MAX_CHARS}
          onChange={(e) => {
            setInput(e.target.value)
            setError("")
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              run()
            }
          }}
        />
        <div className="flex justify-between items-center">
          {error ? (
            <p className="text-ember font-gothic text-sm border border-ember rounded-lg px-4 py-2 bg-darkmaroon w-full mt-1">
              {error}
            </p>
          ) : (
            <p className="text-mauve font-gothic text-xs">
              Press Enter to search, Shift+Enter for new line
            </p>
          )}
          <p className={`font-gothic text-xs ml-auto mt-1 ${isNearLimit ? "text-ember" : "text-mauve"}`}>
            {input.length}/{MAX_CHARS}
          </p>
        </div>
      </div>

      <button
        onClick={run}
        disabled={loading || !input.trim()}
        className="w-full bg-darkmaroon border border-parchment hover:bg-burgundy disabled:opacity-50 disabled:cursor-not-allowed text-parchment font-gothic text-xl py-3 px-5 rounded-lg transition-colors"
      >
        {loading ? "Consulting the spirits..." : "Search"}
      </button>

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-t border-parchment pt-3">
            <p className="text-mauve font-gothic text-xl italic">
              {historyId ? "Save to Idea Storage" : ""}
              <span className="ml-2">{historyId && <StarButton toolHistoryId={historyId} />}</span>
            </p>
          </div>
          <ToolResult result={result} />
        </div>
      )}
    </div>
  )
}