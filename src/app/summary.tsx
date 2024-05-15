import { Readability } from "@mozilla/readability";
import { kv } from "@vercel/kv";
import { JSDOM } from "jsdom";

export const Summary = async ({
  storyId,
  url,
  storyType,
  html,
  realSummary,
}: {
  storyId: number;
  storyType: string;
  url?: string;
  html?: string;
  realSummary: boolean;
}) => {
  if (!url || !html || storyType === "job") {
    return null;
  }
  const { hostname } = new URL(url);
  if (hostname === "twitter.com" || hostname === "x.com") {
    return null;
  }
  const summaryContent = await getSummary(storyId, url, html, realSummary);
  return (
    <span className="font-mono text-sm italic leading-6">{summaryContent}</span>
  );
};

export async function getSummary(
  storyId: number,
  url: string,
  html: string,
  realSummary: boolean,
): Promise<string | null> {
  if (process.env.mode === "dev" && !realSummary) {
    return "summary";
  }

  const key = `summary-${storyId}`;
  const existingSummary = (await kv.get(key)) as string;
  if (existingSummary) {
    return existingSummary;
  }

  const {
    window: { document },
  } = new JSDOM(html, { url });

  const article = new Readability(document).parse();

  if (!article) {
    return null;
  }

  /*   console.log({
    excerpt: article.excerpt,
    textContent: article.textContent.slice(0, 200),
    length: article.textContent.length,
  }); */

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
