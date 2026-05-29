"use client"
import { useState } from "react"

const MAX_CHARS = 500

export default function SearchTool() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const remaining = MAX_CHARS - input.length
  const isNearLimit = remaining <= 100

  const run = async () => {
    setError("")
    const trimmed = input.trim()

    if (!trimmed) {
      setError("Please enter a question or search query.")
      return
    }
    if (trimmed.length < 3) {
      setError("Please enter at least 3 characters.")
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
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.")
      } else {
        setResult(data.result)
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-stone-400 text-sm">
        Ask anything — writing advice, literary history, word origins, general knowledge.
      </p>

      <div className="space-y-1">
        <textarea
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 h-28 resize-none"
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
            <p className="text-red-400 text-xs">{error}</p>
          ) : (
            <p className="text-stone-600 text-xs">Press Enter to search, Shift+Enter for new line</p>
          )}
          <p className={`text-xs ml-auto ${isNearLimit ? "text-amber-400" : "text-stone-600"}`}>
            {input.length}/{MAX_CHARS}
          </p>
        </div>
      </div>

      <button
        onClick={run}
        disabled={loading || !input.trim()}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-900 font-semibold px-5 py-2 rounded-lg transition-colors"
      >
        {loading ? "Searching..." : "Search"}
      </button>

      {result && (
        <div className="bg-stone-800 rounded-lg p-4 text-stone-300 whitespace-pre-wrap text-sm leading-relaxed">
          {result}
        </div>
      )}
    </div>
  )
}