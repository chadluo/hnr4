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
  const { forceRefreshSummary, fakeSummary } = flags;
  const [generation, setGeneration] = React.useState(DEFAULT_SUMMARY);

  React.useEffect(() => {
    let isGenerating = true;
    if (isShowing) {
      (async () => {
        if (fakeSummary || url == null) {
          setGeneration(DEFAULT_SUMMARY);
        } else {
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
        }
      })();
    }
    return () => {
      isGenerating = false;
      setGeneration("");
    };
  }, [storyId, url, isShowing, forceRefreshSummary, fakeSummary]);

  return (
    <span className="font-mono text-sm italic leading-6">{generation}</span>
  );
};
