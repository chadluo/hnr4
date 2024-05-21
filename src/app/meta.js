import { sql } from "@vercel/postgres";
import { parse } from "parse5";

export async function getMeta(storyId, html) {
  const existingMeta =
    await sql`select * from metadata where storyId = ${storyId}`;
  if (existingMeta.rows.length > 0) {
    return existingMeta.rows[0];
  }
  const rawMeta = findRawMeta(html);
  const meta = {
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

  await sql`MERGE INTO metadata as target
    using (values (${storyId},
    ${meta.title?.slice(0, 255)},
    ${meta.image?.slice(0, 255)},
    ${meta.imageAlt?.slice(0, 255)},
    ${meta.authors?.slice(0, 255)},
    ${meta.description?.slice(0, 1024)})) as source (storyId, title, image, imageAlt, authors, description)
    on target.storyId = source.storyId::int
    when matched then
      update set
        added = ${new Date().toISOString()},
        title = source.title,
        image = source.image,
        imageAlt = source.imageAlt,
        authors = source.authors,
        description = source.description
    when not matched then
      insert (storyId, added, title, image, imageAlt, authors, description)
      values (source.storyId::int, ${new Date().toISOString()}, source.title, source.image, source.imageAlt, source.authors, source.description)
    `;

  return meta;
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
