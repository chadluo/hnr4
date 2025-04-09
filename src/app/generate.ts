"use server";

import { openai } from "@ai-sdk/openai";
import { Readability } from "@mozilla/readability";
import { kv } from "@vercel/kv";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { JSDOM } from "jsdom";
import { getHtmlContent } from "./contents";

export async function generateSummary(
  storyId: number,
  url: string,
  forceRefreshSummary?: boolean,
) {
  const stream = createStreamableValue("");

  (async () => {
    const key = `summary-${storyId}`;
    const existingSummary = (await kv.get(key)) as string;
    if (existingSummary && !forceRefreshSummary) {
      stream.update(existingSummary);
      stream.done();
      return;
    }

    const html = await getHtmlContent(url);

    if (!html) {
      stream.done();
      return;
    }

    const {
      window: { document },
    } = new JSDOM(html, { url });

    const article = new Readability(document).parse();

    if (!article || !article.textContent) {
      stream.done();
      return;
    }

    const { textStream } = streamText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: `You are an insightful assistant. Given the content of a webpage, based on your
              knowledge, you can find the most important or most interesting information and
              provide a summary of the information in one sentence. The summary should be in plain
              text with no formatting.`,
        },
        {
          role: "user",
          content: article.textContent,
        },
      ],
      maxTokens: 128,
    });

    let completeResponse = "";
    for await (const delta of textStream) {
      stream.update(delta);
      completeResponse = completeResponse.concat(delta);
    }

    await kv.set(key, completeResponse);
    stream.done();
  })();

  return { output: stream.value };
}
