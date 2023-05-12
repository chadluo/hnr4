import styles from "@/styles/comment.module.css";
import { SyntheticEvent, useEffect, useState } from "react";

type Props = {
  commentId: string;
  expand: boolean;
};

type Comment = {
  text: string;
  kids: number[] | undefined;
};

const CACHE_KEY_COMMENTS = "CACHE_KEY_COMMENTS";

export default function Comment(props: Props) {
  const { commentId, expand } = props;

  const [comment, setComment] = useState<Comment>();
  const [startRender, setStartRender] = useState(false);

  useEffect(() => {
    (async (commentId) => {
      const cache = await caches.open(CACHE_KEY_COMMENTS);
      const url = `https://hacker-news.firebaseio.com/v0/item/${commentId}.json`;
      let response = await cache.match(url);
      if (!response) {
        console.log("requesting", url);
        await cache.add(url);
        response = await cache.match(url);
      }
      setComment(await response?.json());
    })(commentId).catch(console.error);
  }, [commentId]);

  function toggle(event: SyntheticEvent<HTMLDetailsElement, Event>) {
    if ((event.target as HTMLDetailsElement).open && !startRender) {
      setStartRender(true);
    }
  }

  return comment ? (
    <details open={expand} onToggle={(e) => toggle(e)} className={styles.comment}>
      <summary dangerouslySetInnerHTML={{ __html: comment.text }} />
      {startRender && comment.kids?.map((kid) => <Comment key={kid} commentId={kid.toString()} expand={true} />)}
    </details>
  ) : (
    <></>
  );
}
