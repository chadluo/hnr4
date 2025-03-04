"use client";

import { readStreamableValue } from "ai/rsc";
import * as React from "react";
import type { Flags } from "./flags";
import { generateSummary } from "./generate";
import { HNStory } from "./hn";

export type SummaryProps = {
  hnStory: HNStory;
  isShowing: boolean;
  flags: Flags;
  openaiModel: string;
};

const DEFAULT_SUMMARY = "summary";

export const Summary = ({
  hnStory,
  isShowing,
  flags,
  openaiModel,
}: SummaryProps) => {
  const { forceRefreshSummary, fakeSummary } = flags;
  const [generation, setGeneration] = React.useState(DEFAULT_SUMMARY);

  React.useEffect(() => {
    let isGenerating = true;
    if (isShowing) {
      (async () => {
        const { id, url } = hnStory;
        if (fakeSummary || url == null) {
          setGeneration(DEFAULT_SUMMARY);
        } else {
          const { output } = await generateSummary(
            id,
            url,
            openaiModel,
            forceRefreshSummary,
          );
          for await (const delta of readStreamableValue(output)) {
            if (isGenerating) {
              setGeneration(
                (currentGeneration) => `${currentGeneration}${delta}`,
              );
            } else {
              break;
            }
          }
        }
      })();
    }
    return () => {
      isGenerating = false;
      setGeneration("");
    };
  }, [hnStory, isShowing, openaiModel, forceRefreshSummary, fakeSummary]);

  return (
    <span
      className="font-mono text-sm italic leading-6"
      title={`Summary generated by OpenAI ${openaiModel} and may be inaccurate or incorrect.`}
    >
      {generation}
    </span>
  );
};
