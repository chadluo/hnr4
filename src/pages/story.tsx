import styles from "@/styles/story.module.css";
import { useEffect, useRef, useState } from "react";
import Card from "./card";

type StoryProps = {
  storyId: string;
};

type Story = {
  story: { url: string; title: string };
  meta?: { title?: string; description?: string; image?: string };
  summary?: { text?: string[] };
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
  function showDialog() {
    !dialogRef.current?.hasAttribute("open") && dialogRef.current?.showModal();
  }
  function closeDialog() {
    dialogRef.current?.close();
  }

  const card = story && (
    <Card
      title={story.meta?.title || story.story.title}
      url={story.story.url}
      image={story.meta?.image}
      description={story.meta?.description}
    />
  );

  return story ? (
    <div className={styles.story} data-storyId={storyId} onClick={showDialog}>
      <div className={styles.hnTitle}>
        <a href={`https://news.ycombinator.com/item?id=${storyId}`}>{story.story.title}</a>
      </div>
      {card}
      <dialog ref={dialogRef} className={styles.dialog} onClick={undefined}>
        {story.story.title}
        {card}
        {story.summary?.text && story.summary.text.join("")}
        <a onClick={closeDialog}>❌</a>
      </dialog>
    </div>
  ) : (
    <center data-storyId={storyId}>Loading</center>
  );
}
