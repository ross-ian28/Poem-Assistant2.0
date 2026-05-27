import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import PromptTool from "@/components/tools/PromptTool"
import DictionaryTool from "@/components/tools/DictionaryTool"
import ThesaurusTool from "@/components/tools/ThesaurusTool"
import GrammarTool from "@/components/tools/GrammarTool"
import WordGeneratorTool from "@/components/tools/WordGeneratorTool"

const TOOLS = [
  { id: "prompt",     label: "Prompt Generator", icon: "✨", component: <PromptTool /> },
  { id: "dictionary", label: "Dictionary",        icon: "📖", component: <DictionaryTool /> },
  { id: "thesaurus",  label: "Thesaurus",         icon: "🔄", component: <ThesaurusTool /> },
  { id: "grammar",    label: "Grammar Checker",   icon: "✏️", component: <GrammarTool /> },
  { id: "wordgen",    label: "Word Generator",    icon: "💡", component: <WordGeneratorTool /> },
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
          <span className="text-2xl">🖊️</span>
          <span className="font-bold text-lg tracking-tight">Poem Assistant</span>
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
        <nav className="w-56 border-r border-stone-800 p-4 space-y-1 hidden md:block">
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
        </nav>

        {/* Mobile tab bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-800 flex justify-around px-2 py-2 z-10">
          {TOOLS.map((tool) => (
            
            <a
              key={tool.id}
              href={`/dashboard?tool=${tool.id}`}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                activeTool === tool.id
                  ? "text-amber-400"
                  : "text-stone-500"
              }`}
            >
              <span className="text-lg">{tool.icon}</span>
              <span className="hidden xs:block">{tool.label.split(" ")[0]}</span>
            </a>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-10 pb-24 md:pb-10">
          <h2 className="text-2xl font-bold mb-1">{active.icon} {active.label}</h2>
          <div className="mt-6 max-w-2xl">
            {active.component}
          </div>
        </main>
      </div>
    </div>
  )
}