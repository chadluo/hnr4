import { getHtmlContent } from "@/app/contents";
import { fakeSummary } from "@/app/flags";
import type { HNStory } from "@/app/hn";
import { openRouterConfig } from "@/app/model";
import { Readability } from "@mozilla/readability";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamObject } from "ai";
import { JSDOM } from "jsdom";

const DEFAULT_SUMMARY = "summary";

export async function POST(request: Request) {
  const trace: Record<string, unknown> = {};

  const { id, url }: HNStory = await request.json();
  if (!url) {
    return Response.error();
  }

  trace["url"] = url;
  trace["id"] = id;

  if (await fakeSummary()) {
    console.info({ ...trace, result: "fake summary" });
    return new Response(JSON.stringify({ summary: DEFAULT_SUMMARY }));
  }

  //  const key = `summary-${id}`;
  //  const existingSummary = (await kv.get(key)) as string;
  //  if (existingSummary && !(await forceRefreshSummary())) {
  //    trace["existingSummary"] = existingSummary;
  //    console.info({ ...trace, result: "existingSummary" });
  //    return new Response(JSON.stringify({ summary: existingSummary }));
  //  }

  const html = await getHtmlContent(url);
  if (!html) {
    console.error({ ...trace, result: "no html" });
    return Response.error();
  } else {
    trace["html"] = html;
  }

  const {
    window: { document },
  } = new JSDOM(html, { url });
  const article = new Readability(document).parse();
  trace["article"] = article;

  if (!article || !article.textContent) {
    console.error({ ...trace, result: "no textContent" });
    return Response.error();
  } else {
    trace["textContent"] = article.textContent;
  }

  const openrouter = createOpenRouter({ apiKey: openRouterConfig.apiKey });
  const model = openrouter(openRouterConfig.model);
  trace["model"] = model;

  const result = streamObject({
    model,
    schema: openRouterConfig.schema,
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
  });

  console.info({ ...trace, result: "streaming" });
  return result.toTextStreamResponse();
}
