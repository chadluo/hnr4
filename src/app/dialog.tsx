"use client";

import Comment from "@/app/comment";
import classNames from "classnames";
import * as React from "react";
import type { Flags } from "./flags";
import { Summary, type SummaryProps } from "./summary";

// button & dialog body
export const Dialog = ({
  kids,
  text,
  storyId,
  storyType,
  url,
  hnLink,
  openaiModel,
  canVisit,
  flags,
}: {
  kids: number[];
  text: string | undefined;
  storyType: string;
  hnLink: React.JSX.Element;
  openaiModel: string;
  canVisit: boolean;
  flags: Flags;
} & Omit<SummaryProps, "isShowing">) => {
  const dialogRef = React.useRef(null);
  const [isShowing, setShowing] = React.useState(false);

  const openDialog = React.useCallback(() => {
    if (dialogRef.current == null) {
      return;
    }
    (dialogRef.current as HTMLDialogElement).showModal();
    setShowing(true);
    console.log("showing => true");
  }, []);

  const closeDialog = React.useCallback(() => {
    if (dialogRef.current == null) {
      return;
    }
    (dialogRef.current as HTMLDialogElement).close();
    setShowing(false);
    console.log("showing => false");
  }, []);

  const canSummarize = React.useMemo(() => {
    if (
      !canVisit ||
      storyType === "job" ||
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
  }, [canVisit, storyType, url]);

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
        />
      )}
      {kids?.map((kid) => (
        <Comment
          key={kid}
          commentId={kid}
          isExpanded={false}
          isTop={true}
          isShowing={isShowing}
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
        {canSummarize && <>🤖 {" | "}</>}
        💬 {kids?.length ?? 0}
      </a>
      <dialog
        ref={dialogRef}
        className={`h-dvh max-h-dvh w-full ${canSummarize ? "max-w-6xl" : "max-w-4xl"} gap-4 overscroll-contain bg-neutral-900 text-base text-white backdrop:overscroll-contain backdrop:bg-neutral-800/95 md:max-h-[90vh]`}
      >
        <div className="flex h-dvh max-h-dvh flex-col gap-4 p-6 md:max-h-[90vh]">
          <h2 className="flex justify-between gap-4 bg-neutral-900 font-bold">
            {hnLink}
            <a
              onClick={closeDialog}
              className="-m-1 p-1 hover:cursor-pointer hover:bg-neutral-700"
            >
              ❌
            </a>
          </h2>
          <div className="grid grid-cols-1 gap-3 overflow-y-scroll overscroll-contain md:grid-cols-3">
            {canSummarize && (
              <div className="peer">
                <Summary
                  storyId={storyId}
                  url={url}
                  flags={flags}
                  openaiModel={openaiModel}
                  isShowing={isShowing}
                />
              </div>
            )}
            <div className="col-span-3 peer-[]:col-span-2">{discussions}</div>
          </div>
        </div>
      </dialog>
    </>
  );
};
