import { getHtmlContent } from "@/app/contents";
import { fakeSummary } from "@/app/flags";
import type { HNStory } from "@/app/hn";
import { openRouterConfig } from "@/app/model";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { Output, streamText } from "ai";

const DEFAULT_SUMMARY = "summary";

export async function POST(request: Request) {
  const trace: Record<string, unknown> = {};

  const { id, url }: HNStory = await request.json();
  trace["id"] = id;
  if (!url) {
    console.error({ ...trace, result: "no url" });
    return Response.error();
  } else {
    trace["url"] = url;
  }

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

  let content: string | null = null;

  // Try Cloudflare markdown endpoint first
  try {
    const mdResponse = await fetch(url, {
      headers: { Accept: "text/markdown" },
      signal: AbortSignal.timeout(5000),
    });
    const contentType = mdResponse.headers.get("content-type") ?? "";
    if (mdResponse.ok && contentType.includes("text/markdown")) {
      content = await mdResponse.text();
      trace["source"] = "markdown";
    }
  } catch {
    // fall through to HTML parsing
  }

  // Fallback: fetch HTML and extract with Readability
  if (!content) {
    performance.mark("content-start");
    const html = await getHtmlContent(url);
    performance.mark("content-end");
    const contentDuration = performance.measure(
      "content",
      "content-start",
      "content-end",
    );
    trace["contentMs"] = Math.round(contentDuration.duration);

    if (!html) {
      console.error({ ...trace, result: "no html" });
      return Response.error();
    }

    /*
    performance.mark("jsdom-start");
    const {
      window: { document },
    } = new JSDOM(html, { url });
    const article = new Readability(document).parse();
    performance.mark("jsdom-end");
    const jsdomDuration = performance.measure(
      "jsdom",
      "jsdom-start",
      "jsdom-end",
    );
    trace["jsdomMs"] = Math.round(jsdomDuration.duration);

    if (!article || !article.textContent) {
      console.error({ ...trace, result: "no textContent" });
      return Response.error();
    }

    content = article.textContent;
    */

    content = html
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "");
    trace["source"] = "readability";
  }

  trace["content"] = content;

  const openrouter = createOpenRouter({ apiKey: openRouterConfig.apiKey });
  const model = openrouter(openRouterConfig.model);
  trace["model"] = model;

  const result = streamText({
    model,
    output: Output.object({ schema: openRouterConfig.schema }),
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
        content,
      },
    ],
  });

  console.info({ ...trace, result: "streaming" });
  return result.toTextStreamResponse();
}
