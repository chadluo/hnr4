"use client";

import classNames from "classnames";
import { SyntheticEvent, useCallback, useEffect, useState } from "react";

type Props = {
  commentId: number;
  isExpanded: boolean;
  isTop: boolean;
};

type CommentContent = {
  text: string;
  by: string;
  kids: number[] | undefined;
  deleted: boolean | undefined;
  dead: boolean | undefined;
};

export default function Comment(props: Props) {
  const { commentId, isExpanded, isTop } = props;

  const [comment, setComment] = useState<CommentContent>();
  const [startRender, setStartRender] = useState(false);

  const toggle = useCallback(
    (event: SyntheticEvent<HTMLDetailsElement, Event>) => {
      if ((event.target as HTMLDetailsElement).open && !startRender) {
        setStartRender(true);
      }
    },
    [startRender],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then(setComment);
    return () => {
      try {
        controller.abort();
      } catch (err) {
        console.error(err);
      }
    };
  }, [commentId]);

  if (!comment) {
    return <></>;
  }

  const { text, by, kids, deleted, dead } = comment;

  return !deleted && !dead ? (
    <details
      data-commentid={commentId}
      data-kids={kids}
      open={isExpanded}
      onToggle={toggle}
      className={classNames(
        { "pl-8": !isTop },
        "[&_a]:break-words [&_a]:text-[#f60] hover:[&_a]:text-[#f0a675]",
        "[&_p]:mt-2",
        "[&_pre]:overflow-x-auto",
      )}
    >
      <summary
        className={classNames("mb-2", { "list-none": !kids })}
        dangerouslySetInnerHTML={{
          __html: `${text} [<a target="_blank" href="https://news.ycombinator.com/item?id=${commentId}">${by}</a>]`,
        }}
      />
      {startRender &&
        kids?.map((kid) => (
          <Comment key={kid} commentId={kid} isExpanded={true} isTop={false} />
        ))}
    </details>
  ) : (
    <></>
  );
}
