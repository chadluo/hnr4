'use client';

import styles from "@/styles/comment.module.css";
import classNames from "classnames";
import { SyntheticEvent, useEffect, useState } from "react";

type Props = {
  commentId: string;
  expand: boolean;
};

type Comment = {
  by: string;
  text: string;
  kids: number[] | undefined;
  deleted: boolean | undefined;
  dead: boolean | undefined;
};

export default function Comment(props: Props) {
  const { commentId, expand } = props;

  const [comment, setComment] = useState<Comment>();
  const [startRender, setStartRender] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`, { signal: controller.signal })
      .then((response) => response.json())
      .then((json) => {
        setComment(json);
      });
    return () => {
      try {
        controller.abort();
      } catch (err) {
        console.error(err);
      }
    };
  }, [commentId]);

  function toggle(event: SyntheticEvent<HTMLDetailsElement, Event>) {
    if ((event.target as HTMLDetailsElement).open && !startRender) {
      setStartRender(true);
    }
  }

  return comment && !comment.deleted && !comment.dead ? (
    <details
      data-commentid={commentId}
      open={expand}
      onToggle={(e) => toggle(e)}
      className={classNames(styles.comment, { [styles.nokid]: !comment.kids })}
    >
      <summary
        dangerouslySetInnerHTML={{
          __html: `${comment.text} [<a href="https://news.ycombinator.com/item?id=${commentId}">${comment.by}</a>]`,
        }}
      />
      {startRender && comment.kids?.map((kid) => <Comment key={kid} commentId={kid.toString()} expand={true} />)}
    </details>
  ) : (
    <></>
  );
}
