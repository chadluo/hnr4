"use client";

import classNames from "classnames";
import * as React from "react";
import Comment from "./comment";
import type { Flags } from "./flags";
import type { HNStory } from "./hn";
import { Summary, type SummaryProps } from "./summary";

// button & dialog body
export const Dialog = ({
  hnStory,
  hnLink,
  canVisit,
  flags,
}: {
  hnStory: HNStory;
  hnLink: React.JSX.Element;
  canVisit: boolean;
  flags: Flags;
} & Omit<SummaryProps, "isShowing">) => {
  const dialogRef = React.useRef(null);
  const [isShowing, setShowing] = React.useState(false);

  const { id, by, text, kids } = hnStory;

  const openDialog = React.useCallback(() => {
    if (dialogRef.current == null) {
      return;
    }
    (dialogRef.current as HTMLDialogElement).showModal();
    setShowing(true);
    // console.log("showing => true");
  }, []);

  const closeDialog = React.useCallback(() => {
    if (dialogRef.current == null) {
      return;
    }
    (dialogRef.current as HTMLDialogElement).close();
    setShowing(false);
    // console.log("showing => false");
  }, []);

  const canSummarize = React.useMemo(() => {
    const { type, url } = hnStory;
    if (
      !canVisit ||
      type === "job" ||
      url == null ||
      url.endsWith("pdf") ||
      url.endsWith("mp4")
    ) {
      return false;
    }
    const { hostname } = new URL(url);
    if (hostname === "twitter.com" || hostname === "x.com") {
      return false;
    }
    return true;
  }, [canVisit, hnStory]);

  const discussions = (text || kids) && (
    <div>
      {text && (
        <div
          className={classNames(
            "pb-2",
            "[&_a]:break-words [&_a]:text-[#f60] hover:[&_a]:text-[#f0a675]",
            "[&_p]:mt-2",
            "[&_pre]:mb-2 [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:leading-6",
          )}
          dangerouslySetInnerHTML={{
            __html: `${text} [<a href="https://news.ycombinator.com/item?id=${id}">${by}</a>]`,
          }}
        />
      )}
      {kids?.map((kid, index) => (
        <Comment
          key={kid}
          commentId={kid}
          isExpanded={false}
          isTop={true}
          isShowing={isShowing}
          index={index}
          hasStoryText={text != null}
        />
      ))}
    </div>
  );

  return (
    <>
      <a
        onClick={openDialog}
        className="font-normal hover:cursor-pointer hover:bg-neutral-900/70 md:-mx-3 md:-my-2 md:px-3 md:py-2"
      >
        {canSummarize && <>🤖 {" | "}</>}💬 {kids?.length ?? 0}
      </a>
      <dialog
        ref={dialogRef}
        className={classNames(
          "h-dvh w-full bg-neutral-900 text-base text-white backdrop:bg-neutral-800/95 md:h-[90dvh] m-auto",
          canSummarize ? "max-w-6xl" : "max-w-4xl",
        )}
      >
        <div
          className={classNames(
            "grid h-full grid-cols-1 grid-rows-[auto_1fr] gap-x-3 gap-y-4 overscroll-contain p-4 backdrop:overscroll-contain md:p-6",
            { "md:grid-cols-3": canSummarize },
          )}
        >
          <h2
            className={classNames(
              "flex justify-between gap-4 bg-neutral-900 font-bold",
              { "md:col-span-3": canSummarize },
            )}
          >
            {hnLink}
            <a
              onClick={closeDialog}
              className="-m-1 p-1 hover:cursor-pointer hover:bg-neutral-700"
            >
              ❌
            </a>
          </h2>
          {canSummarize && (
            <div>
              <Summary
                hnStory={hnStory}
                flags={flags}
                isShowing={isShowing}
              />
            </div>
          )}
          <div
            className={classNames(
              "col-span-1 overflow-y-scroll overscroll-contain",
              { "md:col-span-2": canSummarize },
            )}
          >
            {discussions}
          </div>
        </div>
      </dialog>
    </>
  );
};
