import * as React from "react";
import { Header } from "../header";
import { getHNTopStories as getHNStories } from "../hn";
import { Story, StoryPlaceholder } from "../story";
import Footer from "../footer";

export default async function Home({
  searchParams,
}: {
  searchParams: { realSummary?: string; forceRefreshSummary?: string };
}) {
  const storyIds = await getHNStories("best");

  const flags = {
    realSummary: process.env.mode === "dev" && searchParams.realSummary != null,
    forceRefreshSummary:
      process.env.mode === "dev" && searchParams.forceRefreshSummary != null,
  };

  return (
    <>
      <Header activePage="best" />
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
