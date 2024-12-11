import { get } from "@vercel/edge-config";
import * as React from "react";
import { fakeSummary, forceRefreshSummary } from "./flags";
import Footer from "./footer";
import { Header } from "./header";
import { getHNStories } from "./hn";
import { Story, StoryPlaceholder } from "./story";

export default async function Home() {
  const flags = {
    forceRefreshSummary: await forceRefreshSummary(),
    fakeSummary: await fakeSummary(),
  };

  const openaiModel = String(await get("openai_model"));

  const storyIds = await getHNStories();

  return (
    <>
      <Header activePage="top" />
      <main className="mx-auto flex min-w-64 max-w-4xl flex-col gap-8 px-4">
        {storyIds.map((storyId) => (
          <React.Suspense key={storyId} fallback={<StoryPlaceholder />}>
            <Story storyId={storyId} openaiModel={openaiModel} flags={flags} />
          </React.Suspense>
        ))}
      </main>
      <Footer />
    </>
  );
}
