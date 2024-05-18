import Footer from "./footer";
import * as React from "react";
import { getHNTopStories } from "./hn";
import { Story, StoryPlaceholder } from "./story";

export default async function Home({
  searchParams,
}: {
  searchParams: { realSummary?: string };
}) {
  const storyIds = await getHNTopStories();

  const title = "Hacker News Reader";

  return (
    <>
      <header className="mx-auto w-5/6 min-w-64 max-w-4xl pb-8 pt-12 font-mono">
        <span>{title}</span>
      </header>
      <main className="mx-auto flex w-5/6 min-w-64 max-w-4xl flex-col gap-8">
        {storyIds.map((storyId) => (
          <React.Suspense
            key={storyId}
            fallback={<StoryPlaceholder full={false} />}
          >
            <Story
              storyId={storyId}
              full={false}
              realSummary={searchParams.realSummary != null}
            />
          </React.Suspense>
        ))}
      </main>
      <Footer />
    </>
  );
}
