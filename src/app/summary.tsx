"use client";

import { readStreamableValue } from "ai/rsc";
import * as React from "react";
import type { Flags } from "./flags";
import { generateSummary } from "./generate";

export type SummaryProps = {
  storyId: number;
  url?: string;
  isShowing: boolean;
  flags: Flags;
};

const DEFAULT_SUMMARY = "summary";

export const Summary = ({ storyId, url, isShowing, flags }: SummaryProps) => {
  const { realSummary, forceRefreshSummary } = flags;
  const [generation, setGeneration] = React.useState(DEFAULT_SUMMARY);

  React.useEffect(() => {
    let isGenerating = true;
    if (isShowing) {
      if (realSummary && url != null) {
        (async () => {
          const { output } = await generateSummary(
            storyId,
            url,
            forceRefreshSummary,
          );
          for await (const delta of readStreamableValue(output)) {
            if (!isGenerating) {
              break;
            } else {
              setGeneration(
                (currentGeneration) => `${currentGeneration}${delta}`,
              );
            }
          }
        })();
      } else {
        setGeneration(DEFAULT_SUMMARY);
      }
    }
    return () => {
      isGenerating = false;
      setGeneration("");
    };
  }, [storyId, url, realSummary, isShowing, forceRefreshSummary]);

  return (
    <span className="font-mono text-sm italic leading-6">{generation}</span>
  );
};
