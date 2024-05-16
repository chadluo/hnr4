"use server";

import { streamText } from "ai";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { kv } from "@vercel/kv";
import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "ai/rsc";

export async function generateSummary(
  storyId: number,
  url: string,
  html: string,
) {
  const stream = createStreamableValue("");

  (async () => {
    /*     const key = `summary-${storyId}`;
    const existingSummary = (await kv.get(key)) as string;
    if (existingSummary) {
      console.log({ key, existingSummary });
      stream.update(existingSummary);
      stream.done();
      return;
    } */

    const {
      window: { document },
    } = new JSDOM(html, { url });

    const article = new Readability(document).parse();

    if (!article) {
      stream.done();
      return;
    }

    const { textStream } = await streamText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: `You are an insightful assistant. Given the content of a webpage, based on your
              knowledge, you can find the most important or most interesting information and
              provide a concise summary of the information. The summary should be in plain text
              with no formatting.`,
        },
        {
          role: "user",
          content: article.textContent,
        },
      ],
      maxTokens: 128,
    });

    let lastDelta = "";
    for await (const delta of textStream) {
      stream.update(delta);
      lastDelta += delta;
    }

    // await kv.set(key, lastDelta);
    stream.done();
  })();

  return { output: stream.value };
}
