"use client"
import { useState } from "react"

export default function GrammarTool() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const run = async () => {
    if (!input.trim()) return
    setLoading(true)
    const res = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool: "grammar", input }),
    })
    const data = await res.json()
    setResult(data.result)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-stone-400 text-sm">Paste a poem or passage to check grammar and get style suggestions.</p>
      <textarea
        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 h-36 resize-none"
        placeholder="Paste your poem or text here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={run}
        disabled={loading}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-900 font-semibold px-5 py-2 rounded-lg transition-colors"
      >
        {loading ? "Checking..." : "Check Grammar"}
      </button>
      {result && (
        <div className="bg-stone-800 rounded-lg p-4 text-stone-300 whitespace-pre-wrap text-sm leading-relaxed">
          {result}
        </div>
      )}
    </div>
  )
}