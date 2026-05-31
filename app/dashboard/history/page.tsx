import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import StarButton from "@/components/StarButton"
import type { ToolHistory, Favorite } from "@prisma/client"

type HistoryWithFavorite = ToolHistory & {
  favorite: Favorite | null
}

const TOOL_LABELS: Record<string, string> = {
  prompt:     "✨ Prompt Generator",
  dictionary: "📖 Dictionary",
  thesaurus:  "🔄 Thesaurus",
  grammar:    "✏️ Grammar Checker",
  wordgen:    "💡 Word Generator",
  rhyme:      "🎵 Rhyme Generator",
  search:     "🔍 General Search",
}

export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      history: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { favorite: true },
      },
    },
  })

  const history: HistoryWithFavorite[] = user?.history ?? []

  return (
    <div className="min-h-screen bg-void text-stone-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-gothic font-bold">History</h1>
          <a href="/dashboard" className="text-amber-500 hover:text-amber-400 text-sm">
            ← Back to tools
          </a>
        </div>

        {history.length === 0 ? (
          <p className="text-stone-500">No history yet. Use a tool to get started.</p>
        ) : (
          <div className="space-y-4">
            {history.map((entry: HistoryWithFavorite) => (
              <div key={entry.id} className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-400 text-sm font-semibold">
                    {TOOL_LABELS[entry.tool] ?? entry.tool}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-stone-500 text-xs">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                    <StarButton
                      toolHistoryId={entry.id}
                      initialStarred={!!entry.favorite}
                    />
                  </div>
                </div>
                <p className="text-stone-300 text-sm mb-3">
                  <span className="text-stone-500">Input: </span>{entry.input}
                </p>
                <div className="bg-stone-800 rounded-lg p-3 text-stone-400 text-sm whitespace-pre-wrap leading-relaxed">
                  {entry.result}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}