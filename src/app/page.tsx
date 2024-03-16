import page from "@/styles/page.module.css";
import { mono, sans } from "@/styles/typography";
import classNames from "classnames";
import { Suspense } from "react";
import Footer from "./footer";
import Story from "./story";

export default async function Home() {
  const storyIds = await getStoryIds();

  const title = "Hacker News Reader";

  return (
    <>
      <header className={classNames(page.header, mono.className)}>
        <span>{title}</span>
      </header>
      <main className={classNames(page.main, sans.className)}>
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
