import { Suspense } from "react";
import Footer from "./footer";
import Story from "./story";

export default async function Home() {
  const storyIds = await getStoryIds();

  const title = "Hacker News Reader";

  return (
    <>
      <header className="mx-auto w-5/6 min-w-64 max-w-6xl pb-8 pt-12 font-mono">
        <span>{title}</span>
      </header>
      <main className="mx-auto flex w-5/6 min-w-64 max-w-6xl flex-col gap-6">
        {storyIds.map((storyId) => (
          <Suspense key={storyId}>
            <Story storyId={storyId} full={false} />
          </Suspense>
        ))}
      </main>
      <Footer />
    </>
  );
}

async function getStoryIds() {
  const TOP_STORIES_ENDPOINT = `https://hacker-news.firebaseio.com/v0/topstories.json?limitToFirst=30&orderBy="$priority"`;
  const storesResponse = await fetch(TOP_STORIES_ENDPOINT, {
    cache: "no-store",
  });

  return (await storesResponse.json()) as number[];
}
