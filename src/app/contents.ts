import { JSDOM } from "jsdom";

export async function getContent(url: string) {
  try {
    new URL(url);
  } catch (err) {
    console.error(`Invalid url [${url}]`);
    return null;
  }
  const html = await fetch(url).then((response) => response.text());
  const document = new JSDOM(html);
  return document;
}
