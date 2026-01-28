# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with this codebase.

## Project Overview

HNR4 (Hacker News Reader 4) is a Next.js application that displays Hacker News stories with rich metadata cards and AI-powered summaries. Hosted at `hnr.adluo.ch`.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Language**: TypeScript 5.9
- **AI**: Vercel AI SDK with OpenRouter provider
- **Content Parsing**: Mozilla Readability, parse5, JSDOM
- **Monitoring**: Sentry, Vercel Analytics
- **Package Manager**: pnpm

## Common Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Project Structure

```
src/
├── app/
│   ├── api/generate/route.ts   # LLM summary generation endpoint
│   ├── story/[slug]/page.tsx   # Individual story page
│   ├── best/page.tsx           # Best stories feed
│   ├── page.tsx                # Home page (top stories)
│   ├── layout.tsx              # Root layout
│   ├── hn.ts                   # Hacker News API service
│   ├── contents.ts             # HTML content fetching
│   ├── meta.ts                 # Metadata extraction
│   └── canVisit.ts             # URL blocklist validation
├── styles/
│   └── globals.css             # Global styles with Tailwind
```

## Key Architecture Patterns

### Server vs Client Components

- Page components (`page.tsx`) are Server Components by default
- Interactive components use `"use client"` directive (Dialog, Summary, Comment)
- Use Suspense boundaries for streaming UI

### Data Flow

1. Server fetches HN story IDs from Firebase API
2. Each story fetches metadata and renders as Card/embed
3. Client-side Dialog handles comments and AI summaries
4. `/api/generate` streams LLM responses using Vercel AI SDK

### Content Extraction Pipeline

```
URL → getHtmlContent() → Mozilla Readability → OpenRouter LLM → Summary
```

## API Endpoints

### POST /api/generate

Generates AI summaries for article content.

- Input: `{ story: HNStory }` (must have `id` and `url`)
- Output: Streams `{ summary: string, model: string }`
- Uses OpenRouter with auto model selection

## External APIs

- **Hacker News**: `https://hacker-news.firebaseio.com/v0/`
- **OpenRouter**: AI model provider (requires `OPENROUTER_API_KEY`)

## Environment Variables

```
OPENROUTER_API_KEY    # Required for AI summaries
SENTRY_DSN            # Error monitoring
```

## Coding Conventions

- Use TypeScript strict mode
- Prefer Server Components; use `"use client"` only when needed
- Use Zod for schema validation
- Follow existing patterns for HN data types (`HNStory`, `HNComment`)
- Use `unstable_cache` or `useCache` for caching expensive operations

## Blocked Domains

The `canVisit.ts` file blocks paywalled/restricted sites:

- WSJ, FT, Bloomberg, Economist, Reuters, Telegraph, Washington Post, Reddit
- PDF and MP4 files are also blocked

## Testing Changes

1. Run `pnpm dev` and test locally
2. Check story cards render correctly
3. Verify AI summaries work (click robot icon in dialog)
4. Test comment loading in dialogs
