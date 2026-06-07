import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import StarButton from "@/components/StarButton"
import type { Favorite, ToolHistory } from "@prisma/client"

type FavoriteWithHistory = Favorite & {
  toolHistory: ToolHistory
}

const TOOL_LABELS: Record<string, string> = {
  prompt:     "Prompt Generator",
  dictionary: "Dictionary",
  thesaurus:  "Thesaurus",
  grammar:    "Grammar Checker",
  wordgen:    "Word Generator",
  rhyme:      "Rhyme Generator",
  search:     "General Search",
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

  const favorites: FavoriteWithHistory[] = user?.favorites ?? []

  return (
    <div className="min-h-screen text-parchment bg-mauve p-6 md:p-10" >
      <div className="max-w-3xl mx-auto"         
      style={{
          backgroundImage: "url('/purple_victorian_background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-5xl font-gothic text-parchment">Idea Storage</h1>
          <a
            href="/dashboard"
            className="text-shadow hover:text-parchment font-gothic text-2xl transition-colors"
          >
            ← Back to tools
          </a>
        </div>

        <p className="text-shadow font-gothic text-lg mb-8">
          Your starred prompts and results saved for later.
        </p>

        <div className="border-t border-rosewood mb-8" />

        {favorites.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-parchment font-gothic text-5xl">✦</p>
            <p className="text-parchment font-gothic text-2xl">
              No ideas have been preserved yet.
            </p>
            <p className="text-mauve font-gothic text-lg">
              Star any result from a tool or your history to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {favorites.map((fav: FavoriteWithHistory) => (
              <div
                key={fav.id}
                className="bg-darkmaroon border border-rosewood rounded-lg p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-parchment font-gothic text-2xl">
                    {TOOL_LABELS[fav.toolHistory.tool] ?? fav.toolHistory.tool}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-mauve font-gothic">
                      {new Date(fav.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <StarButton
                      toolHistoryId={fav.toolHistoryId}
                      initialStarred={true}
                    />
                  </div>
                </div>

                <div className="border-t border-rosewood pt-3">
                  <p className="text-mauve font-gothic text-lg mb-1">Input</p>
                  <p className="text-parchment font-gothic text-xl">
                    {fav.toolHistory.input}
                  </p>
                </div>

                <div className="border-t border-rosewood pt-3">
                  <p className="text-mauve font-gothic text-lg mb-2">Result</p>
                  <div className="bg-burgundy border border-rosewood rounded-lg p-4 text-parchment font-gothic text-base whitespace-pre-wrap leading-relaxed">
                    {fav.toolHistory.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}