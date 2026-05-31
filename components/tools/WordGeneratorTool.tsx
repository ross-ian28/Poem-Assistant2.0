"use client"
import { useState } from "react"
import ToolResult from "@/components/ToolResult"
import StarButton from "@/components/StarButton"

export default function WordGeneratorTool() {
  const [count, setCount] = useState(5)
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [historyId, setHistoryId] = useState<string | null>(null)

  const run = async () => {
    setError("")
    setHistoryId(null)
    setLoading(true)
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "wordgen", input: String(count) }),
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
        Choose how many random words to generate.
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-stone-300 text-sm font-medium">
            Number of words
          </label>
          <span className="text-amber-400 font-bold text-lg w-6 text-center">
            {count}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer"
        />
      </div>

      <button
        onClick={run}
        disabled={loading}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-900 font-semibold px-5 py-2 rounded-lg transition-colors"
      >
        {loading ? "Generating..." : `Generate ${count} Word${count > 1 ? "s" : ""}`}
      </button>

      {error && <p className="text-red-400 text-sm">{error}</p>}

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