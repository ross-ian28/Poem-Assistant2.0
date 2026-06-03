# 🖊️ Poem Assistant

An AI-powered writing toolkit for poets and writers. Built with Next.js, powered by Claude AI.

**Live App:** [https://poem-assistant2-0.vercel.app](https://poem-assistant2-0.vercel.app)

---

## Features

- **Prompt Generator** — Generate random, evocative poem writing prompts
- **Dictionary** — Literary definitions with etymology and poetic usage examples
- **Thesaurus** — Synonyms grouped by tone and nuance for finding the perfect word
- **Grammar Checker** — Grammar and style feedback tailored for poets
- **Word Generator** — Random evocative words by part of speech
- **Rhyme Generator** — Perfect and near rhymes ranked and categorized
- **General Search** — Ask anything about poetry, literature, and writing
- **Idea Storage** — Star and save your favorite generated results
- **History** — Browse your last 50 tool uses

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Authentication | NextAuth.js v5 (Google OAuth) |
| AI | Anthropic Claude API (claude-sonnet-4-5) |
| ORM | Prisma 7 |
| Database (local) | PostgreSQL via Postgres.app |
| Database (production) | Neon (serverless PostgreSQL) |
| Deployment | Vercel |
| Rate Limiting | Upstash Redis |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (via [Postgres.app](https://postgresapp.com) or Docker)
- An [Anthropic API key](https://console.anthropic.com/)
- A Google Cloud project with OAuth credentials

### 1. Clone the repository

```bash
git clone https://github.com/ross-ian28/poem-assistant.git
cd poem-assistant
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

```env
# Generate with: npx auth secret
AUTH_SECRET=your-auth-secret

# From Google Cloud Console
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Anthropic API
ANTHROPIC_API_KEY=your-anthropic-api-key

# Local PostgreSQL
DATABASE_URL="postgresql://localhost:5432/poem_assistant"

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

Also create a `.env` file in the root (required by Prisma CLI):

```env
DATABASE_URL="postgresql://localhost:5432/poem_assistant"
```

### 4. Set up the database

Create the local database:

```bash
psql postgres -c "CREATE DATABASE poem_assistant;"
```

Run migrations:

```bash
npx prisma migrate dev --name init
```

Generate the Prisma client:

```bash
npx prisma generate
```

### 5. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Go to **APIs & Services → OAuth consent screen** and configure it
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
5. Set application type to **Web application**
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret into your `.env.local`

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

---

## Database Schema
User
├── id, email, name, image, createdAt
├── → ToolHistory (one to many)
└── → Favorite (one to many)
ToolHistory
├── id, userId, tool, input, result, createdAt
└── → Favorite (one to one, optional)
Favorite
└── id, userId, toolHistoryId, createdAt
RateLimit
└── id, email, window, count, updatedAt

---

## Security

- Google OAuth only — no passwords stored
- All dashboard routes protected by middleware
- Per-user rate limiting (20 requests/hour) via Upstash Redis
- Input length validation on all tools (max 2000 characters)
- Parameterized queries via Prisma (SQL injection protected)
- Security headers via Next.js config