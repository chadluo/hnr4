"use client";

import * as React from "react";
import { generateSummary } from "./generate";
import { readStreamableValue } from "ai/rsc";

export const Summary = ({
  storyId,
  url,
  html,
  realSummary,
}: {
  storyId: number;
  storyType: string;
  url: string;
  html: string;
  realSummary: boolean;
}) => {
  const [generation, setGeneration] = React.useState("");

  React.useEffect(() => {
    let isGenerating = true;
    if (realSummary) {
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
  }, [storyId, url, html, realSummary]);

  return (
    <span className="font-mono text-sm italic leading-6">{generation}</span>
  );
};
