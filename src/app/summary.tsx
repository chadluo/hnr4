"use client";

import * as React from "react";
import { generateSummary } from "./generate";
import { readStreamableValue } from "ai/rsc";

export type SummaryProps = {
  storyId: number;
  url?: string;
  html?: string;
  startShowing: boolean;
  realSummary: boolean;
};

export const Summary = ({
  storyId,
  url,
  html,
  startShowing,
  realSummary,
}: SummaryProps) => {
  const [generation, setGeneration] = React.useState("");

  React.useEffect(() => {
    let isGenerating = true;
    if (realSummary && startShowing && url != null && html != null) {
      (async () => {
        const { output } = await generateSummary(storyId, url, html);
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
  }, [storyId, url, html, realSummary, startShowing]);

  return (
    <span className="font-mono text-sm italic leading-6">{generation}</span>
  );
};
