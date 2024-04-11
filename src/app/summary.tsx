import { kv } from "@vercel/kv";
import * as React from "react";

export type SummaryContent = { short: string; long: string };

export const Summary = async (props: {
  storyId: number;
  storyType: string;
  url?: string;
}) => {
  const { storyId, url, storyType } = props;
  if (!url || storyType === "job") {
    return null;
  }
  const { hostname } = new URL(url);
  if (hostname === "twitter.com" || hostname === "x.com") {
    return null;
  }
  const summaryContent = await getSummary(storyId, url);
  return (
    <React.Suspense fallback={<div className="h-4 bg-neutral-900"></div>}>
      <span className="font-mono text-sm italic leading-6">
        {summaryContent}
      </span>
    </React.Suspense>
  );
};

export async function getSummary(
  storyId: number,
  url: string,
): Promise<string | null> {
  try {
    new URL(url);
  } catch (err) {
    console.error(`Invalid url [${url}]`);
    return null;
  }

  if (process.env.mode === "dev") {
    return "summary";
  }

  const key = `summary-${storyId}`;
  const existingSummary = (await kv.get(key)) as string;
  if (existingSummary) {
    return existingSummary;
  }

  let response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-2024-04-09",
        messages: [
          {
            role: "system",
            content:
              "You are good at extracting information from websites. When given a URL you can visit the website and find the information that most people would be interested in. Present the message no longer than one paragraph.",
          },
          {
            role: "user",
            content: url,
          },
        ],
        max_tokens: 256,
        top_p: 0.5,
        frequency_penalty: 1,
      }),
    });
  } catch (error) {
    const errorMessage = `Failed requesting summaries for [${url}]`;
    console.error(errorMessage, error);
    return null;
  }

  if (!response.ok) {
    const errorMessage = `Failed requesting summaries for [${url}]`;
    console.error(errorMessage, response);
    return null;
  }

  const json = await response.json();
  if (!json.choices) {
    const errorMessage = `Missing mandatory field 'choices': ${json}`;
    console.error(errorMessage, response);
    return null;
  }

  return json.choices[0].message.content;
}
