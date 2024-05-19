"use client";

import * as React from "react";
import { generateSummary } from "./generate";
import { readStreamableValue } from "ai/rsc";

export type SummaryProps = {
  storyId: number;
  url?: string;
  startShowing: boolean;
  realSummary: boolean;
  forceRefreshSummary: boolean;
};

export const Summary = ({
  storyId,
  url,
  startShowing,
  realSummary,
  forceRefreshSummary,
}: SummaryProps) => {
  const [generation, setGeneration] = React.useState("");

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
      setGeneration("summary");
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
