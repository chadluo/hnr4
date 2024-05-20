"use client";

import * as React from "react";
import { generateSummary } from "./generate";
import { readStreamableValue } from "ai/rsc";
import type { Flags } from "./flags";

export type SummaryProps = {
  storyId: number;
  url?: string;
  startShowing: boolean;
  flags: Flags;
};

const DEFAULT_SUMMARY = "summary";

export const Summary = ({
  storyId,
  url,
  startShowing,
  flags,
}: SummaryProps) => {
  const { realSummary, forceRefreshSummary } = flags;
  const [generation, setGeneration] = React.useState(DEFAULT_SUMMARY);

  React.useEffect(() => {
    let isGenerating = true;
    if (realSummary && startShowing && url != null) {
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
    return () => {
      isGenerating = false;
      setGeneration("");
    };
  }, [storyId, url, realSummary, startShowing, forceRefreshSummary]);

  return (
    <span className="font-mono text-sm italic leading-6">{generation}</span>
  );
};
