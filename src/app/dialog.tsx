"use client";

import classNames from "classnames";
import Link from "next/link";
import * as React from "react";
import { canVisit } from "./can_visit";
import { Comment, EmptyComment } from "./comment";
import type { Flags } from "./flags";
import type { HNStory } from "./hn";
import { Summary, type SummaryProps } from "./summary";

// button & dialog body
export const Dialog = ({
  hnStory,
  flags,
}: { hnStory: HNStory; flags: Flags } & Omit<SummaryProps, "isShowing">) => {
  const dialogRef = React.useRef(null);
  const [isShowing, setShowing] = React.useState(false);

  const { by, id, kids, text, title, type, url } = hnStory;

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
    if (type === "job" || url == null || !canVisit(url)) {
      return false;
    }
    const { hostname } = new URL(url);
    if (hostname === "twitter.com" || hostname === "x.com") {
      return false;
    }
    return true;
  }, [type, url]);

  const discussions = ((text || kids) && (
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
      )) || <EmptyComment />}
    </div>
  )) || <EmptyComment />;

  return (
    <>
      <a
        onClick={openDialog}
        className="font-normal hover:cursor-pointer hover:bg-neutral-900/70 md:-mx-3 md:-my-2 md:px-3 md:py-2"
      >
        {canSummarize && (
          <>
            <i className="fa-solid fa-robot" /> {" | "}
          </>
        )}
        <i className="fa-solid fa-comments" /> {kids?.length ?? 0}
      </a>
      <dialog
        ref={dialogRef}
        className={classNames(
          "mt-auto mb-0 h-dvh w-full bg-neutral-900 text-white backdrop:bg-neutral-800/95 md:m-auto md:h-[90dvh]",
          canSummarize ? "max-w-6xl" : "max-w-4xl",
          "overscroll-contain backdrop:overscroll-contain",
        )}
      >
        <div
          className={classNames(
            "grid h-full grid-cols-1 grid-rows-[auto_1fr] gap-x-3 gap-y-4 p-4 md:p-6",
            { "md:grid-cols-3": canSummarize },
          )}
        >
          <h2
            className={classNames(
              "flex justify-between gap-4 bg-neutral-900 font-bold",
              { "md:col-span-3": canSummarize },
            )}
          >
            {url != null && (
              <Link className="hover:text-neutral-200" href={url}>
                {title}
              </Link>
            )}
            <a
              onClick={closeDialog}
              className="-m-1.5 p-1.5 hover:cursor-pointer hover:bg-neutral-700"
            >
              <i className="fa-solid fa-xmark" />
            </a>
          </h2>
          <div
            className={classNames(
              "grid h-full overflow-y-auto",
              "col-span-full grid-cols-subgrid",
              "gap-y-4 max-md:grid-rows-[auto_1fr] md:row-span-1 md:grid-rows-subgrid",
            )}
          >
            {canSummarize && (
              <div className="col-span-1 row-span-1">
                <Summary
                  hnStory={hnStory}
                  flags={flags}
                  isShowing={isShowing}
                />
              </div>
            )}
            <div
              className={classNames(
                "col-span-1 row-span-1 md:overflow-y-auto",
                {
                  "md:col-span-2": canSummarize,
                },
              )}
            >
              {discussions}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
};
