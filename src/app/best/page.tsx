import * as React from "react";
import Footer from "../footer";
import { Header } from "../header";
import { Story, StoryPlaceholder } from "../story";
import { getHNStories } from "../hn";

export default async function Home({
  searchParams,
}: {
  searchParams: { realSummary?: string; forceRefreshSummary?: string };
}) {
  const storyIds = await getHNStories("best");

  const flags =
    process.env.mode === "dev"
      ? {
          realSummary: searchParams.realSummary != null,
          forceRefreshSummary: searchParams.forceRefreshSummary != null,
        }
      : {
          realSummary: true,
          forceRefreshSummary: false,
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
