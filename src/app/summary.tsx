import { Readability } from "@mozilla/readability";
import { kv } from "@vercel/kv";
import type { JSDOM } from "jsdom";

export const Summary = async ({
  storyId,
  url,
  storyType,
  content,
}: {
  storyId: number;
  storyType: string;
  url?: string;
  content: JSDOM | null | undefined;
}) => {
  if (!url || storyType === "job") {
    return null;
  }
  const { hostname } = new URL(url);
  if (hostname === "twitter.com" || hostname === "x.com") {
    return null;
  }
  const summaryContent = await getSummary(storyId, url, content);
  return (
    <span className="font-mono text-sm italic leading-6">{summaryContent}</span>
  );
};

export async function getSummary(
  storyId: number,
  url: string,
  content: JSDOM | null | undefined,
): Promise<string | null> {
  if (process.env.mode === "dev") {
    return "summary";
  }

  if (content == null) {
    return null;
  }

  const key = `summary-${storyId}`;
  const existingSummary = (await kv.get(key)) as string;
  if (existingSummary) {
    return existingSummary;
  }

  const article = new Readability(content.window.document).parse();

  if (!article) {
    return null;
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
        model: "gpt-4o",
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
