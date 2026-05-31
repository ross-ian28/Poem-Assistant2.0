"use client"
import { useState } from "react"
import ToolResult from "@/components/ToolResult"
import StarButton from "@/components/StarButton"

const MAX_CHARS = 50

export default function ThesaurusTool() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [historyId, setHistoryId] = useState<string | null>(null)

  const run = async () => {
    setError("")
    setHistoryId(null)
    const trimmed = input.trim()
  
    if (!trimmed) {
      setError("Please enter a word.")
      return
    }
    if (trimmed.includes(" ")) {
      setError("Please enter a single word only.")
      return
    }
  
    setLoading(true)
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "thesaurus", input: trimmed }),
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
    <div className="space-y-4">
      <p className="text-stone-400 text-sm">
        Find synonyms grouped by tone and nuance — perfect for finding the right word.
      </p>

      <div className="space-y-1">
        <input
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          placeholder="e.g. sad, beautiful, dark..."
          value={input}
          maxLength={MAX_CHARS}
          onChange={(e) => {
            setInput(e.target.value)
            setError("")
          }}
          onKeyDown={(e) => e.key === "Enter" && run()}
        />
        <div className="flex justify-between items-center">
          {error ? (
            <p className="text-red-400 text-xs">{error}</p>
          ) : (
            <span />
          )}
          <p className="text-stone-600 text-xs ml-auto">
            {input.length}/{MAX_CHARS}
          </p>
        </div>
      </div>

      <button
        onClick={run}
        disabled={loading || !input.trim()}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-900 font-semibold px-5 py-2 rounded-lg transition-colors"
      >
        {loading ? "Finding synonyms..." : "Find Synonyms"}
      </button>

      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-stone-500 text-xs">
              {historyId ? "Save to Idea Storage" : ""}
            </p>
            {historyId && <StarButton toolHistoryId={historyId} />}
          </div>
          <ToolResult result={result} />
        </div>
      )}
    </div>
  )
}