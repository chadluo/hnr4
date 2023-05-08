import { useEffect, useState } from "react";
import styles from "../styles/Story.module.css";

type StoryProps = {
  storyId: string;
};

type Story = {
  story: { url: string; title: string };
  meta?: { title?: string; description?: string; image?: string };
};

export default function Story(props: StoryProps) {
  const [story, setStory] = useState<Story>();

  useEffect(() => {
    fetch(`/api/story?storyId=${props.storyId}`)
      .then((response) => response.json())
      .then((s) => {
        setStory(s);
      });

    return () => {};
  }, [props.storyId]);

  return story ? (
    <div className={styles.story} data-storyId={props.storyId}>
      {story.story.title}
      {story.meta?.image && (
        <div className={styles.imageBox} style={{ backgroundImage: `url(${story.meta.image})` }}></div>
      )}
      <a href={story.story.url}>
        <strong>{story.meta?.title || story.story.title}</strong>
      </a>
      {story.meta?.description?.substring(0, 300)}
    </div>
  ) : (
    <></>
  );
}
