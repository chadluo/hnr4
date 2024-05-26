import * as React from "react";
import Footer from "../footer";
import { Header } from "../header";
import { getHNStories } from "../hn";
import { Story, StoryPlaceholder } from "../story";

export default async function Home({
  searchParams,
}: {
  searchParams: { realSummary?: string; forceRefreshSummary?: string };
}) {
  const flags =
    process.env.NODE_ENV !== "production"
      ? {
          realSummary: searchParams.realSummary != null,
          forceRefreshSummary: searchParams.forceRefreshSummary != null,
        }
      : {
          realSummary: true,
          forceRefreshSummary: false,
        };

  const storyIds = await getHNStories("best");

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
