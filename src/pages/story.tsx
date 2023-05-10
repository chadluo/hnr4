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

export default function Story(props: StoryProps) {
  const { storyId } = props;

  const [story, setStory] = useState<Story>();

  useEffect(() => {
    fetch(`/api/story?storyId=${storyId}`)
      .then((response) => response.json())
      .then((s) => {
        setStory(s);
      });

    return () => {};
  }, [storyId]);

  const dialogRef = useRef<HTMLDialogElement>(null);

  function showDialog() {
    !dialogRef.current?.hasAttribute("open") && dialogRef.current?.showModal();
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
      <div className={styles.hnTitle}>{story.story.title}</div>
      {card}
      <dialog ref={dialogRef} className={styles.dialog} onClick={undefined}>
        {story.story.title}
        {card}
        {story.summary?.text && story.summary.text.join("")}
        <form method="dialog">
          <button>OK</button>
        </form>
      </dialog>
    </div>
  ) : (
    <center>Loading</center>
  );
}
