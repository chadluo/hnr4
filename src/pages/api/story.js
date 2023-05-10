import kv from "@vercel/kv";
import { NextResponse } from "next/server";
import { parse } from "parse5";

export const config = {
  runtime: "edge",
};

const DEFAULT_TIMEOUT_MS = 5000;
const TIME_INTERVAL_1H = 1000 * 60 * 60;

export default async function handler(request) {
  const storyId = new URL(request.url).searchParams.get("storyId");
  if (!storyId) {
    return NextResponse.error();
  }

  const lastUpdate = new Date().getTime();
  const story = await (await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`)).json();
  const [meta, summary] = await Promise.all([
    findMetadata(storyId, story, lastUpdate),
    findSummary(storyId, story, lastUpdate),
  ]);

  return NextResponse.json({ story, meta, summary });
}

// meta

async function findMetadata(storyId, story, lastUpdate) {
  const { url } = story;
  if (!url || url.toLowerCase().endsWith("pdf")) {
    return {};
  }
  const key = `meta-${storyId}`;
  const existingMetadata = await kv.get(key);
  if (existingMetadata?.lastUpdate > lastUpdate - TIME_INTERVAL_1H) {
    return existingMetadata;
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
    lastUpdate,
  };
  await kv.set(key, metadata);

  return metadata;
}

function findRawMeta(html) {
  const parsed = parse(html);
  const headNode = parsed.childNodes
    .find((node) => node.nodeName === "html")
    .childNodes.find((node) => node.nodeName === "head");
  const rawMeta = Object.fromEntries(
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

  return rawMeta;
}

// summary

async function findSummary(storyId, story, lastUpdate) {
  const { url, type } = story;
  if (type === "job") {
    return {};
  }
  const key = `summary-${storyId}`;
  const existingSummary = await kv.get(key);
  if (existingSummary?.lastUpdate > lastUpdate - TIME_INTERVAL_1H * 24) {
    return existingSummary;
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
      prompt: `Summarize ${url}`,
      max_tokens: 256,
      temperature: 0,
    }),
  });
  const json = await response.json();
  const summary = {
    text: json.choices.map((choice) => choice.text),
    lastUpdate,
  };
  await kv.set(key, summary);

  return summary;
}
