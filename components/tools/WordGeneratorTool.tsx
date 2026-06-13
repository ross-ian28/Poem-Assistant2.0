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
    <div className="space-y-6">
      <p className="text-mauve text-lg font-gothic">
        Choose how many random words to generate.
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-parchment font-gothic text-3xl">
            Number of words: <span className="ml-1 relative top-0.5">{count}</span>
          </label>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-mauve cursor-pointer"
        />
      </div>

      <button
        onClick={run}
        disabled={loading}
        className="w-full bg-darkmaroon border border-parchment hover:bg-burgundy disabled:opacity-50 disabled:cursor-not-allowed text-parchment font-gothic text-xl py-3 px-5 rounded-lg transition-colors"
      >
        {loading ? "Conjuring..." : `Generate ${count} Word${count > 1 ? "s" : ""}`}
      </button>

      {error && (
        <p className="text-ember font-ancient text-sm border border-ember rounded-lg px-4 py-2 bg-darkmaroon">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-t border-parchment pt-3">
            <p className="text-mauve font-gothic text-3xl">
              {historyId ? "Save to Idea Storage:" : ""}
              <span className="ml-2">{historyId && <StarButton toolHistoryId={historyId} />}</span>
            </p>
          </div>
          <ToolResult result={result} />
        </div>
      )}
    </div>
  )
}