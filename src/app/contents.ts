import { unstable_cache } from "next/cache";

export const getHtmlContent = unstable_cache(
  async (url: string) => getHtmlContent2(url),
  ["htmlContent"],
  { revalidate: 60 },
);

async function getHtmlContent2(url: string) {
  if (!URL.canParse(url)) {
    return;
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    // temp workaround https://github.com/jsdom/jsdom/issues/2005
    return html
      ?.replace(/<style([\S\s]*?)>([\S\s]*?)<\/style>/gim, "")
      ?.replace(/<script([\S\s]*?)>([\S\s]*?)<\/script>/gim, "");
  } catch (err) {
    console.error({ error: "Cannot fetch html: " + err, url });
  }
}
