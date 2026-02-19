# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HNR4 (Hacker News Reader 4) is a Next.js application that displays Hacker News stories with rich metadata cards and AI-powered summaries. Hosted at `hnr.adluo.ch`.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19 and React Compiler enabled
- **Styling**: Tailwind CSS 4 with IBM Plex Sans/Mono fonts
- **Language**: TypeScript 5.9 (strict mode)
- **AI**: Vercel AI SDK v5 with OpenRouter provider (`openrouter/auto` model)
- **Content Parsing**: parse5 for metadata extraction, Mozilla Readability + JSDOM for article text
- **Monitoring**: Sentry (tunneled via `/monitoring`), Vercel Analytics + Speed Insights
- **Package Manager**: pnpm (v10)

## Commands

```bash
pnpm dev          # Dev server on port 4000
pnpm build        # Production build
pnpm start        # Production server on port 4000
pnpm lint         # ESLint (flat config with CSS linting)
```

No test framework is configured. Verify changes manually via `pnpm dev`.

## Architecture

### Component Rendering Strategy

Pages are **Server Components** that use `React.Suspense` for streaming. Each story renders independently:

```
page.tsx (Server) → Story (async Server) → Card (async Server, "use server")
                                         → Dialog ("use client") → Summary ("use client")
                                                                  → Comment ("use client")
```

- `story.tsx`: Async Server Component that fetches a single HN story and decides rendering: embedded tweet (react-tweet), YouTube iframe, or metadata Card
- `card.tsx`: Marked `"use server"` — async component that fetches HTML, extracts metadata, and renders a link card with OG image
- `dialog.tsx`: Client component with native `<dialog>` for comments and AI summary side-by-side
- `summary.tsx`: Client component using `experimental_useObject` from `@ai-sdk/react` to stream structured AI summaries

### Data Flow

1. `hn.ts` fetches story IDs and individual items from the HN Firebase API (no caching, `cache: "no-store"`)
2. `contents.ts` fetches external page HTML with `"use cache"` directive and 5s timeout, gated by `can_visit.ts` blocklist
3. `meta.ts` extracts OG/Twitter metadata from HTML using parse5 (no DOM, just tree walking)
4. `/api/generate/route.ts` receives a story, fetches + parses article via Readability, then streams a structured summary via OpenRouter

### Feature Flags

`flags.ts` uses the `flags` package (Vercel feature flags). In non-production, `fakeSummary` and `forceRefreshSummary` default to `true`, meaning dev mode returns fake summaries instead of calling OpenRouter.

### Content Blocklist

`can_visit.ts` prevents fetching from paywalled sites (WSJ, FT, Bloomberg, Economist, Reuters, Telegraph, WaPo, Reddit) and blocks PDF/MP4 URLs. This gates both Card metadata fetching and AI summary generation.

## Key Patterns

- **Shared Zod schema**: `model.ts` defines the OpenRouter response schema (`{ summary, model }`) shared between the API route and client-side `useObject`
- **Icons**: Font Awesome loaded via external kit script, referenced as `fa-solid fa-*` classes
- **Background**: Root layout generates random oklch gradient on each render (not deterministic)
- **Caching**: `contents.ts` uses `"use cache"` + `force-cache` with 1hr revalidation; tweets cached via `unstable_cache` for 24hrs
- **JSDOM import**: In `route.ts`, JSDOM is imported via `require()` (not ESM) due to missing type mappings — keep this pattern if modifying

## Environment Variables

```
OPENROUTER_API_KEY    # Required for AI summaries (only used in production; dev uses fake summaries)
SENTRY_DSN            # Error monitoring
```
