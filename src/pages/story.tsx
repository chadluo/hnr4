import { useEffect, useState } from "react";

export type StoryProps = {
  storyId: string;
};

export function Story(props: StoryProps) {
  const [story, setStory] = useState({
    url: "",
    meta: { title: "", description: "", image: "" },
  });

  useEffect(() => {
    fetch(`/api/meta?storyId=${props.storyId}`)
      .then((response) => response.json())
      .then((s) => {
        setStory(s);
      });

    return () => {};
  }, [props.storyId]);

  return (
    <div>
      <a href={story.url}>
        <strong>{story.meta.title}</strong>
      </a>
      <img src={story.meta.image} />
      {story.meta.description}
    </div>
  );
}
