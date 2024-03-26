import { Suspense } from "react";
import Footer from "./footer";
import { getHNTopStories } from "./hn";
import Story from "./story";

export default async function Home() {
  const storyIds = await getHNTopStories();

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
