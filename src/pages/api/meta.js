import { NextResponse } from "next/server";
import { parse } from "parse5";

export const config = {
  runtime: "edge",
};

export default async function handler(request) {
  const storyId = new URL(request.url).searchParams.get("storyId");
  const story = await (await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`)).json();
  const [meta] = await Promise.all([findMetadata(story.url)]);
  return NextResponse.json({
    story,
    meta,
  });
}

const DEFAULT_TIMEOUT_MS = 5000;

async function findMetadata(url) {
  const controller = new AbortController();
  let html, abortTimeout;
  try {
    abortTimeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    html = await fetch(url, { signal: controller.signal }).then((response) => response.text());
  } catch (err) {
    console.error({
      error: "Cannot fetch html " + err,
      storyId,
      url,
    });
    return {};
  }
  clearTimeout(abortTimeout);
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

  return {
    title: rawMeta["title"] || rawMeta["og:title"] || rawMeta["twitter:title"],
    description: rawMeta["description"] || rawMeta["og:description"] || rawMeta["twitter:description"],
    image: rawMeta["og:image"] || rawMeta["twitter:image"],
  };
}
