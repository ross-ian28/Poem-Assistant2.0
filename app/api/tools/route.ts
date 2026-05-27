import { auth } from "@/auth"
import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const client = new Anthropic()

const TOOL_PROMPTS: Record<string, (input: string) => string> = {
  prompt: (input) =>
    `You are a creative writing assistant specializing in poetry. Generate 5 unique, inspiring poem writing prompts based on this theme or request: "${input}". Format each prompt on its own line starting with a number and period. Make them evocative, specific, and imaginative.`,

  dictionary: (input) =>
    `You are a literary dictionary. Define the word "${input}" with: 1) A clear definition, 2) Its part of speech, 3) Etymology if interesting, 4) An example used in a poetic or literary sentence. Format clearly with labeled sections.`,

  thesaurus: (input) =>
    `You are a poet's thesaurus. For the word "${input}", provide: 1) 8-10 synonyms grouped by nuance/tone (e.g., formal, lyrical, archaic, modern), 2) Brief notes on the feel or connotation of each. Format with clear groupings to help a poet choose the perfect word.`,

  grammar: (input) =>
    `You are a grammar and style editor for poets and writers. Review the following text: "${input}". Provide: 1) Grammar corrections with explanations, 2) Style suggestions for clarity or impact, 3) A corrected version. Note: for poetry, flag but don't force corrections where intentional rule-breaking serves the art.`,

  wordgen: (input) =>
    `You are a creative word generator for poets. Based on this theme, mood, or concept: "${input}", generate: 1) 10 evocative nouns, 2) 8 vivid verbs, 3) 8 atmospheric adjectives, 4) 3 unusual or archaic words that fit the theme. Format in clearly labeled lists.`,
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session) {
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
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: promptFn(input) }],
  })

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")

  return NextResponse.json({ result: text })
}