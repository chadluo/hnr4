"use client";

import classNames from "classnames";
import * as React from "react";
import { HNComment, getHNComment } from "./hn";

type Props = {
  commentId: number;
  isExpanded: boolean;
  isTop: boolean;
  isShowing: boolean;
};

export default function Comment(props: Props) {
  const { commentId, isExpanded, isTop, isShowing } = props;

  const [comment, setComment] = React.useState<HNComment>();
  const [isLocalShowing, setLocalShowing] = React.useState(isShowing);

  React.useEffect(() => {
    const controller = new AbortController();
    if (isShowing) {
      getHNComment(commentId, controller).then(setComment);
    } else {
      try {
        controller.abort("Aborted loading comment");
      } catch (err) {
        console.error(err);
      }
    }
    return () => {
      try {
        controller.abort("Aborted loading comment");
      } catch (err) {
        console.error(err);
      }
    };
  }, [commentId, isShowing]);

  if (!comment) {
    return <></>;
  }

  const { text, by, kids, deleted, dead } = comment;

  return !deleted && !dead ? (
    <details
      data-commentid={commentId}
      data-kids={kids}
      open={isExpanded}
      onToggle={(event) => {
        if ((event.target as HTMLDetailsElement).open && !isLocalShowing) {
          setLocalShowing(true);
        }
      }}
      className={classNames(
        { "pl-8": !isTop },
        "[&_a]:break-words [&_a]:text-[#f60] hover:[&_a]:text-[#f0a675]",
        "[&_p]:mt-2",
        "[&_pre]:mb-2 [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:leading-6",
      )}
    >
      <summary
        className={classNames("mb-2", { "list-none": !kids })}
        dangerouslySetInnerHTML={{
          __html: `${text} [<a target="_blank" href="https://news.ycombinator.com/item?id=${commentId}">${by}</a>]`,
        }}
      />
      {isShowing &&
        kids?.map((kid) => (
          <Comment
            key={kid}
            commentId={kid}
            isExpanded={true}
            isTop={false}
            isShowing={isLocalShowing}
          />
        ))}
    </details>
  ) : (
    <></>
  );
}
