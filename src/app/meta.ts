// import { sql } from "@vercel/postgres";
import { parse } from "parse5";
import type { Attribute } from "parse5/dist/common/token";
import type {
  Element,
  Node,
  TextNode,
} from "parse5/dist/tree-adapters/default";

export type Meta = {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  authors?: string;
};

export async function getMeta(storyId: number, html: string) {
  //  const existingMeta =
  //    await sql`select * from metadata where storyId = ${storyId}`;
  //  if (existingMeta.rows.length > 0) {
  //    return existingMeta.rows[0];
  //  }
  const rawMeta = findRawMeta(storyId, html);
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

  //  await sql`MERGE INTO metadata as target
  //    using (values (${storyId},
  //    ${meta.title?.slice(0, 255)},
  //    ${meta.image?.slice(0, 255)},
  //    ${meta.imageAlt?.slice(0, 255)},
  //    ${meta.authors?.slice(0, 255)},
  //    ${meta.description?.slice(0, 1024)})) as source (storyId, title, image, imageAlt, authors, description)
  //    on target.storyId = source.storyId::int
  //    when matched then
  //      update set
  //        added = ${new Date().toISOString()},
  //        title = source.title,
  //        image = source.image,
  //        imageAlt = source.imageAlt,
  //        authors = source.authors,
  //        description = source.description
  //    when not matched then
  //      insert (storyId, added, title, image, imageAlt, authors, description)
  //      values (source.storyId::int, ${new Date().toISOString()}, source.title, source.image, source.imageAlt, source.authors, source.description)
  //    `;

  return meta;
}

function findRawMeta(storyId: number, html: string): Map<string, string[]> {
  const parsed = parse(html, { scriptingEnabled: false });
  const htmlNode: Element | undefined = parsed?.childNodes.find(
    (node: Node) => node.nodeName === "html",
  ) as Element | undefined;
  const headNode: Element | undefined = htmlNode?.childNodes.find(
    (node: Node) => node.nodeName === "head",
  ) as Element | undefined;
  const rawMeta = headNode?.childNodes
    .map((node) => {
      if (node.nodeName === "title") {
        return ["title", (node.childNodes[0] as TextNode).value] as [
          string,
          string,
        ];
      }

      if (node.nodeName === "meta") {
        const key = node.attrs.find(
          (attr: Attribute) => attr.name === "property" || attr.name === "name",
        )?.value;
        const value = node.attrs.find(
          (attr: Attribute) => attr.name === "content",
        )?.value;
        if (key == null || value == null) {
          return;
        }
        return [key, value] as [string, string];
      }
    })
    .reduce(
      (map: Map<string, string[]>, entry: [string, string] | undefined) => {
        if (entry == null) {
          return map;
        }
        const [key, value] = entry;
        if (map.has(key)) {
          map.get(key)?.push(value);
        } else {
          map.set(key, [value]);
        }
        return map;
      },
      new Map(),
    );
  if (!rawMeta) {
    console.warn("Cannot load metadata", { storyId });
    return new Map();
  }
  return rawMeta;
}
