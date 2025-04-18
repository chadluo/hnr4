import * as React from "react";
import { fakeSummary, forceRefreshSummary } from "../flags.ts";
import Footer from "../footer.tsx";
import { Header } from "../header.tsx";
import { getHNStories } from "../hn.ts";
import { Story, StoryPlaceholder } from "../story.tsx";

export default async function Page() {
  const flags = {
    forceRefreshSummary: await forceRefreshSummary(),
    fakeSummary: await fakeSummary(),
  };

  const storyIds = await getHNStories("best");

  return (
    <>
      <Header activePage="best" />
      <main className="mx-auto flex min-w-64 max-w-4xl flex-col gap-8 px-4">
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
