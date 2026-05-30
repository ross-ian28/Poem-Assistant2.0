"use client"
import { useState } from "react"
import ToolResult from "@/components/ToolResult"

const MAX_CHARS = 1000

export default function GrammarTool() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const remaining = MAX_CHARS - input.length
  const isNearLimit = remaining <= 200

  const run = async () => {
    setError("")
    const trimmed = input.trim()

    if (!trimmed) {
      setError("Please enter some text to check.")
      return
    }
    if (trimmed.length < 10) {
      setError("Please enter at least 10 characters.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "grammar", input: trimmed }),
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
        Paste a poem or passage to check grammar and get style suggestions.
      </p>

      <div className="space-y-1">
        <textarea
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 h-36 resize-none"
          placeholder="Paste your poem or text here..."
          value={input}
          maxLength={MAX_CHARS}
          onChange={(e) => {
            setInput(e.target.value)
            setError("")
          }}
        />
        <div className="flex justify-between items-center">
          {error ? (
            <p className="text-red-400 text-xs">{error}</p>
          ) : (
            <span />
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
        {loading ? "Checking..." : "Check Grammar"}
      </button>

      {result && <ToolResult result={result} />}

    </div>
  )
}