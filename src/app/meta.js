import { parse } from "parse5";

export async function getMeta(html) {
  const rawMeta = findRawMeta(html);
  return {
    title: (rawMeta.get("title") ??
      rawMeta.get("og:title") ??
      rawMeta.get("twitter:title"))?.[0],
    description: (rawMeta.get("description") ??
      rawMeta.get("og:description") ??
      rawMeta.get("twitter:description"))?.[0],
    image: (rawMeta.get("og:image") ?? rawMeta.get("twitter:image"))?.[0],
    imageAlt: (rawMeta.get("og:image:alt") ??
      rawMeta.get("twitter:image:alt"))?.[0],
    authors: rawMeta.get("citation_author")?.join(" | "),
  };
}

function findRawMeta(html) {
  const parsed = parse(html);
  const headNode = parsed.childNodes
    .find((node) => node.nodeName === "html")
    .childNodes.find((node) => node.nodeName === "head");
  return headNode.childNodes
    .map((node) => {
      if (node.nodeName !== "meta") {
        return;
      }
      const key = node.attrs.find(
        (attr) => attr.name === "property" || attr.name === "name",
      )?.value;
      const value = node.attrs.find((attr) => attr.name === "content")?.value;
      return [key, value];
    })
    .filter((entry) => entry != null)
    .reduce((map, [key, value]) => {
      if (map.has(key)) {
        map.get(key).push(value);
      } else {
        map.set(key, [value]);
      }
      return map;
    }, new Map());
}
