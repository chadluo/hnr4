import styles from "@/styles/index.module.css";
import classNames from "classnames";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Footer from "./footer";
import Story from "./story";

type HNStory = {
  id: number;
  title: string;
  url?: string;
  text?: string;
  kids: number[];
  type: "job" | "story" | "comment" | "poll" | "pollopt";
};

const sans = IBM_Plex_Sans({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});
const mono = IBM_Plex_Mono({ weight: "400", subsets: ["latin"] });

export default async function Home() {
  const storyIds = await getStoryIds();
  const stories = await Promise.all(storyIds.map(getHnStory));

  const title = "Hacker News Reader";

  return (
    <>
      <header className={classNames(styles.header, mono.className)}>
        <span>{title}</span>
      </header>
      <main className={classNames(styles.main, sans.className)}>
        {stories.map(({ id, title, url, text, kids, type }) => (
          <Story
            key={id}
            storyId={id}
            title={title}
            url={url}
            text={text}
            kids={kids}
            type={type}
          />
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
  const storyIds = (await storesResponse.json()) as number[];

  return storyIds;
}

async function getHnStory(storyId: number) {
  const response = await fetch(
    `http://localhost:4000/api/story?storyId=${storyId}`
  );
  return { id: storyId, ...(await response.json()) } as HNStory;
}
