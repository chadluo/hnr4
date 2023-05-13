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
  story: { url: string; title: string; kids: number[] };
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

  const [showKids, setShowKids] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  function showDialog(event: MouseEvent) {
    if ((event.target as Element).closest("a")) return;
    !dialogRef.current?.hasAttribute("open") && dialogRef.current?.showModal();
    setShowKids(true);
  }
  function closeDialog() {
    dialogRef.current?.close();
    setShowKids(false);
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
    <div className={styles.story} data-storyid={storyId} onClick={showDialog}>
      <a href={`https://news.ycombinator.com/item?id=${storyId}`} className={styles.hnTitle} target="_blank">
        {story.story.title}
      </a>
      {card()}
      <span className={`${monoFont.className} ${styles.shortSummarization}`}>{shortSummarization}</span>
      <Dialog
        ref={dialogRef}
        onClickClose={closeDialog}
        showKids={() => showKids}
        storyId={storyId}
        title={story.story.title}
        card={card}
        longSummarization={longSummarization}
        kids={story.story.kids}
      />
    </div>
  ) : (
    <center data-storyid={storyId}>Loading</center>
  );
}
