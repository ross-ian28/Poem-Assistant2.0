import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import StarButton from "@/components/StarButton"
import type { ToolHistory, Favorite } from "@prisma/client"

type HistoryWithFavorite = ToolHistory & {
  favorite: Favorite | null
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
    <div className="min-h-screen text-parchment bg-mauve p-6 md:p-10">
      <div
        className="max-w-3xl mx-auto"
        style={{
          backgroundImage: "url('/purple_victorian_background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-5xl font-gothic text-parchment">History</h1>
          <a
            href="/dashboard"
            className="text-shadow hover:text-parchment font-gothic text-2xl transition-colors"
          >
            ← Back to tools
          </a>
        </div>

        <p className="text-shadow font-gothic text-lg mb-8">
          Your last 50 tool uses, preserved in the archive.
        </p>

        <div className="border-t border-rosewood mb-8" />

        {history.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-parchment font-gothic text-5xl">✦</p>
            <p className="text-parchment font-gothic text-2xl">
              The archive is empty.
            </p>
            <p className="text-shadow font-gothic text-lg">
              Use a tool to begin filling the pages.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((entry: HistoryWithFavorite) => (
              <div
                key={entry.id}
                className="bg-darkmaroon border border-rosewood rounded-lg p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-parchment font-gothic text-xl">
                    {TOOL_LABELS[entry.tool] ?? entry.tool}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-shadow font-gothic text-sm">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <StarButton
                      toolHistoryId={entry.id}
                      initialStarred={!!entry.favorite}
                    />
                  </div>
                </div>

                <div className="border-t border-rosewood pt-3">
                  <p className="text-shadow font-gothic text-sm mb-1">Input</p>
                  <p className="text-parchment font-gothic text-lg">
                    {entry.input}
                  </p>
                </div>

                <div className="border-t border-rosewood pt-3">
                  <p className="text-shadow font-gothic text-sm mb-2">Result</p>
                  <div className="bg-burgundy border border-rosewood rounded-lg p-4 text-parchment font-gothic text-base whitespace-pre-wrap leading-relaxed">
                    {entry.result}
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