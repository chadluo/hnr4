import Footer from "./footer";
import * as React from "react";
import { getHNTopStories } from "./hn";
import { Story, StoryPlaceholder } from "./story";

export default async function Home({
  searchParams,
}: {
  searchParams: { realSummary?: string; forceRefreshSummary?: string };
}) {
  const storyIds = await getHNTopStories();

  const title = "Hacker News Reader";

  const flags = {
    realSummary: process.env.mode === "dev" && searchParams.realSummary != null,
    forceRefreshSummary:
      process.env.mode === "dev" && searchParams.forceRefreshSummary != null,
  };

  return (
    <>
      <header className="mx-auto w-5/6 min-w-64 max-w-4xl pb-8 pt-12 font-mono">
        <span>{title}</span>
      </header>
      <main className="mx-auto flex w-5/6 min-w-64 max-w-4xl flex-col gap-8">
        {storyIds.map((storyId) => (
          <React.Suspense key={storyId} fallback={<StoryPlaceholder />}>
            <Story storyId={storyId} flags={flags} />
          </React.Suspense>
        ))}
      </main>
      <Footer />
    </>
  );
}
