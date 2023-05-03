import { NextResponse } from "next/server";
import { parse } from "parse5";

export const config = {
  runtime: "edge",
};

export default async function handler(request) {
  const hnStoryId = new URL(request.url).searchParams.get("storyId");
  const hnStory = await (await fetch(`https://hacker-news.firebaseio.com/v0/item/${hnStoryId}.json`)).json();
  const url = hnStory.url;
  hnStory.meta = await findMetadata(url);
  return NextResponse.json(hnStory);
}

async function findMetadata(url) {
  const html = await fetch(url).then((response) => response.text());
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
