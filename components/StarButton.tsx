"use client"
import { useState } from "react"

interface Props {
  toolHistoryId: string
  initialStarred?: boolean
}

export default function StarButton({ toolHistoryId, initialStarred = false }: Props) {
  const [starred, setStarred] = useState(initialStarred)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      if (starred) {
        await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolHistoryId }),
        })
        setStarred(false)
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolHistoryId }),
        })
        setStarred(true)
      }
    } catch {
      console.error("Failed to toggle favorite")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={starred ? "Remove from Idea Storage" : "Save to Idea Storage"}
      className={`transition-all duration-200 disabled:opacity-50 hover:scale-110 text-xl leading-none ${
        starred ? "text-amber-400" : "text-stone-600 hover:text-amber-400"
      }`}
    >
      {starred ? "★" : "☆"}
    </button>
  )
}