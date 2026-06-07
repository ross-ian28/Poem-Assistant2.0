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
  { id: "prompt",     label: "Prompt Generator", component: <PromptTool /> },
  { id: "dictionary", label: "Dictionary",       component: <DictionaryTool /> },
  { id: "thesaurus",  label: "Thesaurus",        component: <ThesaurusTool /> },
  { id: "grammar",    label: "Grammar Checker",  component: <GrammarTool /> },
  { id: "wordgen",    label: "Word Generator",   component: <WordGeneratorTool /> },
  { id: "rhyme",      label: "Rhyme Generator",  component: <RhymeTool /> },
  { id: "search",     label: "General Search",   component: <SearchTool /> },
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
    <div className="min-h-screen bg-redvelvet text-stone-100 flex flex-col">
      {/* Header */}
      <header className="border-b bg-darkmaroon border-parchment px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Poem Assistant"
            className="h-16 w-auto"
          />
          <span className="font-gothic text-5xl tracking-tight text-parchment">
            Poem Assistant
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* checks - ancient or gothic font */}
          <span className="text-parchment text-3xl font-gothic hidden sm:block">
            {session.user?.name}
          </span>
          {session.user?.image && (
            <img
              src={session.user.image}
              alt="avatar"
              className="w-12 h-12 rounded-full"
            />
          )}
          <a
            href="/dashboard/ideas"
            className="text-parchment hover:text-mauve text-2xl font-gothic transition-colors"
          >
            Idea Storage
          </a>
          <a
            href="/dashboard/history"
            className="text-parchment hover:text-mauve text-2xl font-gothic transition-colors"
          >
            History
          </a>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <button
              type="submit"
              className="text-parchment hover:text-mauve text-2xl font-gothic transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
  
      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-56 bg-darkmaroon border-r border-parchment p-4 space-y-1 hidden md:flex md:flex-col">
          <div className="space-y-1">
            {TOOLS.map((tool) => (
              <a
                key={tool.id}
                href={`/dashboard?tool=${tool.id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xl font-gothic transition-colors ${
                  activeTool === tool.id
                    ? "bg-mauve text-parchment font-semibold"
                    : "text-parchment hover:text-shadow hover:bg-dusk"
                }`}
              >
                {tool.label}
              </a>
            ))}
          </div>
  
          <div className="mt-4 pt-4 border-t border-parchment space-y-1">
            <a
              href="/dashboard/ideas"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xl font-gothic text-parchment hover:text-parchment hover:bg-dusk transition-colors"
            >
              Idea Storage
            </a>
            <a
              href="/dashboard/history"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xl font-gothic text-parchment hover:text-parchment hover:bg-dusk transition-colors"
            >
              History
            </a>
          </div>
        </nav>
  
        {/* Main content */}
        <main className="flex-1 relative">
  {/* Background image */}
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: "url('/images/purple_victorian_background.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
    }}
  />

  {/* Dark overlay to keep text readable */}
  <div className="absolute inset-0 bg-darkmaroon opacity-20" />

  {/* Content sits above the overlay */}
  <div className="relative z-10 p-6 md:p-10 pb-24 md:pb-10">
    <h2 className="font-gothic text-parchment text-3xl mb-1">{active.label}</h2>
    <div className="mt-6 max-w-2xl">
      <ActiveTool id={activeTool} />
    </div>
  </div>
</main>
      </div>
    </div>
  )
}