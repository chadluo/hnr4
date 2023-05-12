import styles from "@/styles/story.module.css";
import { IBM_Plex_Mono } from "next/font/google";
import { MouseEvent, useEffect, useRef, useState } from "react";
import Card from "./card";
import Dialog from "./dialog";

const monoFont = IBM_Plex_Mono({ subsets: ["latin"], weight: "400", style: "italic" });

type StoryProps = {
  storyId: string;
};

type Story = {
  story: { url: string; title: string };
  meta?: { title?: string; description?: string; image?: string };
  summary?: { text?: `${string}/${string}` };
};

const CACHE_KEY_STORIES = "CACHE_KEY_STORIES";

export default function Story(props: StoryProps) {
  const { storyId } = props;
  const [story, setStory] = useState<Story>();
  useEffect(() => {
    (async (storyId: string) => {
      const cache = await caches.open(CACHE_KEY_STORIES);
      const url = `/api/story?storyId=${storyId}`;
      let response = await cache.match(url);
      if (!response) {
        await cache.add(url);
        response = await cache.match(url);
      }
      setStory(await response?.json());
    })(storyId).catch(console.error);

    return () => {};
  }, [storyId]);

  const dialogRef = useRef<HTMLDialogElement>(null);
  function showDialog(event: MouseEvent) {
    if ((event.target as Element).closest("a")) return;
    !dialogRef.current?.hasAttribute("open") && dialogRef.current?.showModal();
  }
  function closeDialog() {
    dialogRef.current?.close();
  }

  const card = () =>
    story && (
      <Card
        title={story.meta?.title || story.story.title}
        url={story.story.url}
        image={story.meta?.image}
        description={story.meta?.description}
      />
    );

  const text = story?.summary?.text;
  const [shortSummarization, longSummarization] = (text && text.split("/")) || [undefined, undefined];

  return story ? (
    <div className={styles.story} data-storyId={storyId} onClick={showDialog}>
      <a href={`https://news.ycombinator.com/item?id=${storyId}`} className={styles.hnTitle} target="_blank">
        {story.story.title}
      </a>
      <span className={`${monoFont.className} ${styles.shortSummarization}`}>{shortSummarization}</span>
      {card()}
      <Dialog
        ref={dialogRef}
        title={story.story.title}
        card={card}
        longSummarization={longSummarization}
        onClickClose={closeDialog}
      />
    </div>
  ) : (
    <center data-storyId={storyId}>Loading</center>
  );
}
