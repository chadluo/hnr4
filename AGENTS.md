# AGENTS.md

Guidelines for AI coding agents working with this codebase.

## Project Summary

A Next.js 16 web app displaying Hacker News stories with rich preview cards and LLM-generated summaries.

## Architecture

### Core Technologies

- Next.js 16 App Router with React 19
- TypeScript with strict mode
- Tailwind CSS 4 for styling
- Vercel AI SDK for LLM integration
- pnpm as package manager

### Directory Structure

```
src/app/
├── api/generate/       # AI summary generation endpoint
├── story/[slug]/       # Dynamic story detail pages
├── best/               # Best stories feed
├── page.tsx            # Home (top stories)
├── layout.tsx          # Root layout with fonts/analytics
├── hn.ts               # Hacker News Firebase API client
├── contents.ts         # HTML fetching with caching
├── meta.ts             # OpenGraph/meta extraction
└── canVisit.ts         # URL blocklist
```

### Component Patterns

**Server Components** (default):

- `page.tsx` files for data fetching
- `Card.tsx` for metadata display
- `Story.tsx` for story wrapper logic

**Client Components** (`"use client"`):

- `Dialog.tsx` - Modal for comments/summary
- `Summary.tsx` - AI summary with streaming
- `Comment.tsx` - Lazy-loaded comment threads

### Data Types

```typescript
type HNStory = {
  id: number;
  by: string;
  title: string;
  url?: string;
  text?: string;
  kids?: number[];
  type: "job" | "story" | "comment" | "poll" | "pollopt";
};

type HNComment = {
  text: string;
  by: string;
  kids: number[] | undefined;
  deleted: boolean | undefined;
  dead: boolean | undefined;
};
```

## Key Files to Understand

| File                            | Purpose                       |
| ------------------------------- | ----------------------------- |
| `src/app/hn.ts`                 | Hacker News API functions     |
| `src/app/api/generate/route.ts` | LLM summary endpoint          |
| `src/app/contents.ts`           | Cached HTML content fetching  |
| `src/app/meta.ts`               | Metadata extraction from HTML |
| `src/app/canVisit.ts`           | URL validation/blocklist      |

## Commands

```bash
pnpm dev      # Development server
pnpm build    # Production build
pnpm lint     # ESLint check
```

## Code Style Guidelines

1. **TypeScript**: Use strict typing, avoid `any`
2. **Components**: Prefer Server Components, mark Client Components explicitly
3. **Validation**: Use Zod schemas for API responses
4. **Caching**: Use `unstable_cache` for expensive operations
5. **Error Handling**: Log errors with context (story id, url)
6. **Imports**: Use `@/` path alias for src directory

## API Integration

### Hacker News API

- Base URL: `https://hacker-news.firebaseio.com/v0/`
- Endpoints: `/topstories.json`, `/beststories.json`, `/item/{id}.json`
- No authentication required

### OpenRouter LLM

- Provider: `@openrouter/ai-sdk-provider`
- Model: `openrouter/auto` (auto-selects best model)
- Requires `OPENROUTER_API_KEY` environment variable

## Content Pipeline

```
Story URL
    ↓
getHtmlContent() - Fetch with 5s timeout, 1hr cache
    ↓
Mozilla Readability - Extract article text
    ↓
OpenRouter API - Generate one-sentence summary
    ↓
Stream response to client
```

## Blocked Content

URLs blocked in `canVisit.ts`:

- Paywalled sites: wsj.com, ft.com, bloomberg.com, economist.com, reuters.com
- File types: .pdf, .mp4
- Other: reddit.com, telegraph.co.uk, washingtonpost.com

## Testing Checklist

When modifying code, verify:

- [ ] Story cards render with images/metadata
- [ ] Tweet embeds display correctly
- [ ] YouTube videos embed properly
- [ ] AI summaries generate (click robot icon)
- [ ] Comments load in dialog
- [ ] No TypeScript errors (`pnpm build`)
