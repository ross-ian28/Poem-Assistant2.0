import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 h"),
})

const client = new Anthropic()

const TOOL_PROMPTS: Record<string, (input: string) => string> = {
  prompt: (input) =>
    `You are a creative writing assistant specializing in poetry. Generate exactly ${input} unique poem writing prompts completely at random — no themes or subjects have been provided, so surprise the reader. Vary the style, mood, subject matter, and form across all prompts. Format each prompt like this, with the text indented on a new line after the number:

    1. [prompt text here]

    2. [prompt text here]

    Continue this format for all ${input} prompts.`,

  dictionary: (input) =>
    `You are a literary dictionary. Define the word "${input}". Provide a clear, thorough definition covering its primary meaning, part of speech, etymology if interesting, and any notable poetic or literary usage. Write it as a single flowing paragraph like a high quality dictionary entry — no lists, no numbering, no bullet points. End with one example sentence using the word in a poetic or literary context, labeled "Example:".`,

  thesaurus: (input) =>
    `You are a poet's thesaurus. For the word "${input}", return exactly 10 synonyms. Vary them across tone and register — include formal, lyrical, archaic, and modern options. Format each entry like this, with the synonym and its connotation note indented on a new line after the number:

    1. [synonym] — [one-line note on its tone or connotation]

    2. [synonym] — [one-line note on its tone or connotation]

    Continue this format for all 10 synonyms.`,

  grammar: (input) =>
    `You are a grammar and style editor for poets and writers. Review the following text: "${input}". Provide: 1) Grammar corrections with explanations, 2) The original text but corrected. Where the text is a poem, flag but do not force corrections where intentional rule-breaking serves the art. For any lists in your response, format each item like this, with the text indented on a new line after the number:

    1. [item text here]

    2. [item text here]`,

  wordgen: (input) =>
    `You are a creative word generator for poets. Generate exactly ${input} random words suitable for use in poetry. Choose completely at random across all parts of speech — nouns, verbs, adjectives, adverbs. Favor words that are evocative, musical, or unusual over common everyday words. Format each entry like this, with the word details indented on a new line after the number:

    1. [word] ([part of speech]) — [one sentence on its poetic quality]

    2. [word] ([part of speech]) — [one sentence on its poetic quality]

    Continue this format for all ${input} words.`,

  rhyme: (input) =>
    `You are a rhyme assistant for poets with a wide knowledge of uncommon and surprising words. For the word "${input}", generate exactly 10 rhymes following these strict rules:

    - No more than 4 perfect rhymes. The rest must be near rhymes or slant rhymes.
    - Draw from a wide range of vocabulary: archaic words, technical terms, foreign-origin words, proper nouns, and colloquial words are all fair game.
    - Every time this prompt is run the list must be different — do not repeat the same words across generations. Imagine you are pulling from a large pool of hundreds of possible rhymes and sampling randomly from it each time.
    - Include a mix of one-syllable, two-syllable, and multi-syllable words.

    Format each entry like this, with the content on the same line as the number:

    1. [rhyming word] — [perfect / near / slant rhyme] — [one-line note on why a poet might use this word]

    2. [rhyming word] — [perfect / near / slant rhyme] — [one-line note on why a poet might use this word]

    Continue this format for all 10 rhymes.`,

  search: (input) =>
    `You are a knowledgeable writing and general research assistant. Answer the following question concisely and clearly: "${input}". Keep your response under 200 words. If the topic relates to poetry, literature, or writing give extra depth within that limit.`,
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Rate limit check
    const { success, limit, remaining, reset } = await ratelimit.limit(session.user.email)
    if (!success) {
      const resetDate = new Date(reset)
      const minutesUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / 1000 / 60)
      return NextResponse.json(
        {
          error: "rate_limit",
          message: `You have used all ${limit} of your hourly requests. Your limit resets in ${minutesUntilReset} minute${minutesUntilReset === 1 ? "" : "s"}.`,
          remaining: 0,
          reset: resetDate.toISOString(),
        },
        { status: 429 }
      )
    }

    const { tool, input } = await req.json()

    if (!tool || !input) {
      return NextResponse.json({ error: "Missing tool or input" }, { status: 400 })
    }

    const validTools = ["prompt", "dictionary", "thesaurus", "grammar", "wordgen", "rhyme", "search"]
    if (!validTools.includes(tool)) {
      return NextResponse.json({ error: "Unknown tool" }, { status: 400 })
    }

    if (typeof input !== "string" || input.trim().length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    if (input.length > 2000) {
      return NextResponse.json(
        { error: "Input too long. Maximum 2000 characters." },
        { status: 400 }
      )
    }

    const promptFn = TOOL_PROMPTS[tool]

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
    let historyId: string | null = null
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      })
      if (dbUser) {
        const entry = await prisma.toolHistory.create({
          data: { userId: dbUser.id, tool, input, result },
        })
        historyId = entry.id
      }
    } catch (dbError) {
      console.error("Database error:", dbError)
    }

    return NextResponse.json({ result, historyId, remaining })

  } catch (error) {
    console.error("Tool route error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}