import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import StarButton from "@/components/StarButton"

const TOOL_LABELS: Record<string, string> = {
  prompt:     "✨ Prompt Generator",
  dictionary: "📖 Dictionary",
  thesaurus:  "🔄 Thesaurus",
  grammar:    "✏️ Grammar Checker",
  wordgen:    "💡 Word Generator",
  rhyme:      "🎵 Rhyme Generator",
  search:     "🔍 General Search",
}

export default async function IdeasPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      favorites: {
        orderBy: { createdAt: "desc" },
        include: {
          toolHistory: true,
        },
      },
    },
  })

  const favorites = user?.favorites ?? []

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Idea Storage</h1>
          <a href="/dashboard" className="text-amber-500 hover:text-amber-400 text-sm">
            ← Back to tools
          </a>
        </div>
        <p className="text-stone-500 text-sm mb-8">
          Your starred prompts and results saved for later.
        </p>

        {favorites.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="text-4xl">⭐</p>
            <p className="text-stone-400">No ideas saved yet.</p>
            <p className="text-stone-600 text-sm">
              Star any result from a tool or your history to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((fav) => (
              <div key={fav.id} className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-400 text-sm font-semibold">
                    {TOOL_LABELS[fav.toolHistory.tool] ?? fav.toolHistory.tool}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-stone-500 text-xs">
                      {new Date(fav.createdAt).toLocaleDateString(undefined, {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                    <StarButton
                      toolHistoryId={fav.toolHistoryId}
                      initialStarred={true}
                    />
                  </div>
                </div>
                <p className="text-stone-300 text-sm mb-3">
                  <span className="text-stone-500">Input: </span>
                  {fav.toolHistory.input}
                </p>
                <div className="bg-stone-800 rounded-lg p-3 text-stone-400 text-sm whitespace-pre-wrap leading-relaxed">
                  {fav.toolHistory.result}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}