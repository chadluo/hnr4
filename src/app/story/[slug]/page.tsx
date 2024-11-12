import { get } from "@vercel/edge-config";
import * as React from "react";
import { fakeSummary, forceRefreshSummary } from "../../flags";
import Footer from "../../footer";
import { Header } from "../../header";
import { Story, StoryPlaceholder } from "../../story";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: number }>;
}) {
  const flags = {
    forceRefreshSummary: await forceRefreshSummary(),
    fakeSummary: await fakeSummary(),
  };

  const openaiModel = String(await get("openai_model"));

  const storyId = (await params).slug;

  return (
    <>
      <Header />
      <main className="mx-auto flex w-5/6 min-w-64 max-w-4xl flex-col gap-8">
        <React.Suspense key={storyId} fallback={<StoryPlaceholder />}>
          <Story storyId={storyId} openaiModel={openaiModel} flags={flags} />
        </React.Suspense>
      </main>
      <Footer />
    </>
  );
}
