import { NextResponse } from "next/server";
import { parse } from "parse5";

export const config = {
  runtime: "edge",
};

const DEFAULT_TIMEOUT_MS = 10000;

export default async function handler(request) {
  const storyId = new URL(request.url).searchParams.get("storyId");
  if (!storyId) {
    return NextResponse.error();
  }
  const story = await (await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`)).json();
  const [meta, summary] = await Promise.all([findMetadata(storyId, story), findSummary(storyId, story)]);
  return NextResponse.json({ story, meta, summary }, { headers: { "Cache-Control": "max-age=0, s-maxage=21600" } });
}

// meta

async function findMetadata(storyId, story) {
  const { url } = story;
  if (!url || url.toLowerCase().endsWith("pdf")) {
    return {};
  }
  const controller = new AbortController();
  let html, abortTimeout;
  try {
    abortTimeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    html = await fetch(url, { signal: controller.signal }).then((response) => response.text());
  } catch (err) {
    console.error({ error: "Cannot fetch html: " + err, storyId, url });
    return {};
  }
  clearTimeout(abortTimeout);
  const rawMeta = findRawMeta(html);
  const metadata = {
    title: rawMeta["title"] || rawMeta["og:title"] || rawMeta["twitter:title"],
    description: rawMeta["description"] || rawMeta["og:description"] || rawMeta["twitter:description"],
    image: rawMeta["og:image"] || rawMeta["twitter:image"],
  };

  return metadata;
}

function findRawMeta(html) {
  const parsed = parse(html);
  const headNode = parsed.childNodes
    .find((node) => node.nodeName === "html")
    .childNodes.find((node) => node.nodeName === "head");
  return Object.fromEntries(
    headNode.childNodes
      .map((node) => {
        if (node.nodeName !== "meta") {
          return;
        }
        const key = node.attrs.find((attr) => attr.name === "property" || attr.name === "name")?.value;
        const value = node.attrs.find((attr) => attr.name === "content")?.value;
        return [key, value];
      })
      .filter((entry) => entry != null)
  );
}

// summary

async function findSummary(storyId, story) {
  const { url, type } = story;
  if (!url || type === "job") {
    return {};
  }
  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: `Visit and summarize ${url}:`,
      max_tokens: 128,
      top_p: 0.5,
      frequency_penalty: 1,
    }),
  });
  const json = await response.json();
  return {
    text: json.choices.map((choice) => choice.text),
  };
}
