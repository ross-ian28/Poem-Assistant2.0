import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import PromptTool from "@/components/tools/PromptTool"
import DictionaryTool from "@/components/tools/DictionaryTool"
import ThesaurusTool from "@/components/tools/ThesaurusTool"
import GrammarTool from "@/components/tools/GrammarTool"
import WordGeneratorTool from "@/components/tools/WordGeneratorTool"
import RhymeTool from "@/components/tools/RhymeTool"
import SearchTool from "@/components/tools/SearchTool"

function ActiveTool({ id }: { id: string }) {
  switch (id) {
    case "prompt":     return <PromptTool />
    case "dictionary": return <DictionaryTool />
    case "thesaurus":  return <ThesaurusTool />
    case "grammar":    return <GrammarTool />
    case "wordgen":    return <WordGeneratorTool />
    case "rhyme":      return <RhymeTool />
    case "search":     return <SearchTool />
    default:           return <PromptTool />
  }
}

const TOOLS = [
  { id: "prompt",     label: "Prompt Generator", icon: "✨", component: <PromptTool /> },
  { id: "dictionary", label: "Dictionary",        icon: "📖", component: <DictionaryTool /> },
  { id: "thesaurus",  label: "Thesaurus",         icon: "🔄", component: <ThesaurusTool /> },
  { id: "grammar",    label: "Grammar Checker",   icon: "✏️", component: <GrammarTool /> },
  { id: "wordgen",    label: "Word Generator",    icon: "💡", component: <WordGeneratorTool /> },
  { id: "rhyme",      label: "Rhyme Generator",   icon: "🎵", component: <RhymeTool /> },
  { id: "search",     label: "General Search",    icon: "🔍", component: <SearchTool /> },
]

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>
}) {
  const session = await auth()
  if (!session) redirect("/")

  const params = await searchParams
  const activeTool = params.tool ?? "prompt"
  const active = TOOLS.find((t) => t.id === activeTool) ?? TOOLS[0]

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Poem Assistant"
            className="h-8 w-auto"
          />
          <span className="font-gothic text-xl tracking-tight text-stone-100">
            Poem Assistant
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-stone-400 text-sm hidden sm:block">
            {session.user?.name}
          </span>
          {session.user?.image && (
            <img
              src={session.user.image}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
          )}
          <a
            href="/dashboard/ideas"
            className="text-stone-400 hover:text-stone-100 text-sm transition-colors"
          >
            ⭐ Idea Storage
          </a>
          <a
            href="/dashboard/history"
            className="text-stone-400 hover:text-stone-100 text-sm transition-colors"
          >
            🕐 History
          </a>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <button
              type="submit"
              className="text-stone-400 hover:text-stone-100 text-sm transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
  
      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-56 border-r border-stone-800 p-4 space-y-1 hidden md:flex md:flex-col">
          <div className="space-y-1">
            {TOOLS.map((tool) => (
              <a
                key={tool.id}
                href={`/dashboard?tool=${tool.id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTool === tool.id
                    ? "bg-amber-500 text-stone-900 font-semibold"
                    : "text-stone-400 hover:text-stone-100 hover:bg-stone-800"
                }`}
              >
                <span>{tool.icon}</span>
                {tool.label}
              </a>
            ))}
          </div>
  
          <div className="mt-4 pt-4 border-t border-stone-800 space-y-1">
            <a
              href="/dashboard/ideas"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            >
              <span>⭐</span>
              Idea Storage
            </a>
            <a
              href="/dashboard/history"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            >
              <span>🕐</span>
              History
            </a>
          </div>
        </nav>
  
        {/* Main content */}
        <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10">
          <h2 className="font-gothic text-3xl mb-1">{active.icon} {active.label}</h2>
          <div className="mt-6 max-w-2xl">
            <ActiveTool id={activeTool} />
          </div>
        </main>
      </div>
    </div>
  )
}