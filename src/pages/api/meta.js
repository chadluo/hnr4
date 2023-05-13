import { NextResponse } from "next/server";
import { parse } from "parse5";

export const config = { runtime: "edge" };

const DEFAULT_TIMEOUT_MS = 10000;

export default async function hander(request) {
  const url = new URL(request.url).searchParams.get("url");
  try {
    new URL(url);
  } catch (err) {
    return NextResponse.error();
  }

  const controller = new AbortController();
  let html, abortTimeout;
  try {
    abortTimeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    html = await fetch(url, { signal: controller.signal }).then((response) => response.text());
  } catch (err) {
    console.error({ error: "Cannot fetch html: " + err, url });
    return NextResponse.error();
  }
  clearTimeout(abortTimeout);
  const rawMeta = findRawMeta(html);
  const metadata = {
    title: rawMeta["title"] || rawMeta["og:title"] || rawMeta["twitter:title"],
    description: rawMeta["description"] || rawMeta["og:description"] || rawMeta["twitter:description"],
    image: rawMeta["og:image"] || rawMeta["twitter:image"],
  };

  return NextResponse.json(metadata, { headers: { "Cache-Control": "max-age=0, s-maxage=21600" } });
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
