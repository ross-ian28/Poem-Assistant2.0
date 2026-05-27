import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const client = new Anthropic()

const TOOL_PROMPTS: Record<string, (input: string) => string> = {
  prompt: (input) =>
    `You are a creative writing assistant specializing in poetry. Generate exactly ${input} unique poem writing prompts completely at random — no themes or subjects have been provided, so surprise the reader. Vary the style, mood, subject matter, and form across all prompts. Format each on its own line starting with a number and period.`,
  dictionary: (input) =>
    `You are a literary dictionary. Define the word "${input}" with: 1) A clear definition, 2) Its part of speech, 3) Etymology if interesting, 4) An example used in a poetic or literary sentence. Format clearly with labeled sections.`,
  thesaurus: (input) =>
    `You are a poet's thesaurus. For the word "${input}", provide: 1) 8-10 synonyms grouped by nuance/tone (e.g., formal, lyrical, archaic, modern), 2) Brief notes on the feel or connotation of each. Format with clear groupings to help a poet choose the perfect word.`,
  grammar: (input) =>
    `You are a grammar and style editor for poets and writers. Review the following text: "${input}". Provide: 1) Grammar corrections with explanations, 2) Style suggestions for clarity or impact, 3) A corrected version. Note: for poetry, flag but don't force corrections where intentional rule-breaking serves the art.`,
  wordgen: (input) =>
    `You are a creative word generator for poets. Generate exactly ${input} random words suitable for use in poetry. Choose completely at random across all parts of speech — nouns, verbs, adjectives, adverbs. Favor words that are evocative, musical, or unusual over common everyday words. List each word on its own line with its part of speech in parentheses, and a one-sentence note on its poetic quality.`,
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { tool, input } = await req.json()

  if (!tool || !input) {
    return NextResponse.json({ error: "Missing tool or input" }, { status: 400 })
  }

  const promptFn = TOOL_PROMPTS[tool]
  if (!promptFn) {
    return NextResponse.json({ error: "Unknown tool" }, { status: 400 })
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: promptFn(input) }],
  })

  const result = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")

  // Save to database
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (dbUser) {
    await prisma.toolHistory.create({
      data: {
        userId: dbUser.id,
        tool,
        input,
        result,
      },
    })
  }

  return NextResponse.json({ result })
}