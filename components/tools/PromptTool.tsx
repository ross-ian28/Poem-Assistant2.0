"use client"
import { useState } from "react"

export default function PromptTool() {
  const [count, setCount] = useState(5)
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    const res = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool: "prompt", input: String(count) }),
    })
    const data = await res.json()
    setResult(data.result)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-stone-400 text-sm">
        Choose how many random poem prompts to generate.
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-stone-300 text-sm font-medium">
            Number of prompts 
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
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-900 font-semibold px-5 py-2 rounded-lg transition-colors"
      >
        {loading ? "Generating..." : `Generate ${count} Prompt${count > 1 ? "s" : ""}`}
      </button>

      {result && (
        <div className="bg-stone-800 rounded-lg p-4 text-stone-300 whitespace-pre-wrap text-sm leading-relaxed">
          {result}
        </div>
      )}
    </div>
  )
}