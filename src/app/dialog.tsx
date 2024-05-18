"use client";

import Comment from "@/app/comment";
import classNames from "classnames";
import * as React from "react";
import { Summary, SummaryProps } from "./summary";

// button & dialog body
export const Dialog = ({
  kids,
  text,
  storyId,
  storyType,
  url,
  html,
  realSummary,
  hnLink,
}: {
  kids: number[];
  text: string | undefined;
  storyType: string;
  hnLink: JSX.Element;
} & Omit<SummaryProps, "startShowing">) => {
  const dialogRef = React.useRef(null);
  const [startShowing, setStartShowing] = React.useState(false);
  const openDialog = React.useCallback(() => {
    if (dialogRef.current == null) {
      return;
    }
    (dialogRef.current as HTMLDialogElement).showModal();
    setStartShowing(true);
  }, []);

  const canSummarize = React.useMemo(() => {
    if (storyType === "job" || url == null) {
      return false;
    }
    const { hostname } = new URL(url);
    if (hostname === "twitter.com" || hostname === "x.com") {
      return false;
    }
    return true;
  }, [storyType, url]);

  const discussions = (text || kids) && (
    <div className="[&>details:not(:first-of-type)]:border-t [&>details:not(:first-of-type)]:border-neutral-600 [&>details:not(:first-of-type)]:pt-2">
      {text && (
        <div
          className={classNames(
            "[&_a]:break-words [&_a]:text-[#f60] hover:[&_a]:text-[#f0a675]",
            "[&_p]:mt-2",
            "[&_pre]:mb-2 [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:leading-6",
          )}
          dangerouslySetInnerHTML={{ __html: text }}
        ></div>
      )}
      {kids &&
        kids.map((kid) => (
          <Comment key={kid} commentId={kid} isExpanded={false} isTop={true} />
        ))}
    </div>
  );

  return (
    <>
      <a onClick={openDialog}>
        {canSummarize && (
          <>
            <i className="fa-solid fa-robot"></i>
            {" | "}
          </>
        )}
        <i className="fa-regular fa-comments"></i> {kids?.length ?? 0}
      </a>
      <dialog
        ref={dialogRef}
        className="max-h-[90vh] max-w-5xl overscroll-none bg-neutral-900 p-6 text-base text-white backdrop:overscroll-none"
      >
        <h2 className="font-bold">{hnLink}</h2>
        <div className="h-4"></div>
        <div className="grid grid-cols-3 gap-3">
          {canSummarize && (
            <div>
              <Summary
                storyId={storyId}
                url={url}
                html={html}
                realSummary={realSummary}
                startShowing={startShowing}
              />
            </div>
          )}
          <div className="col-span-2">{discussions}</div>
        </div>
      </dialog>
    </>
  );
};
