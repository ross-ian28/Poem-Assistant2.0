"use client"
import { useState } from "react"
import ToolResult from "@/components/ToolResult"

const MAX_CHARS = 50

export default function RhymeTool() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const run = async () => {
    setError("")
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
        body: JSON.stringify({ tool: "rhyme", input: trimmed }),
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
        Enter a word to find its 10 closest rhymes, ranked from perfect to slant.
      </p>

      <div className="space-y-1">
        <input
          className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          placeholder="e.g. moon, fire, stone..."
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
        {loading ? "Finding rhymes..." : "Find Rhymes"}
      </button>

      {result && <ToolResult result={result} />}
    </div>
  )
}