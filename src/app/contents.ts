import { unstable_cache } from "next/cache";

const DEFAULT_TIMEOUT_MS = 10000;

export const getHtmlContent = unstable_cache(
  async (url: string) => getHtmlContent2(url),
  ["htmlContent"],
  { revalidate: 60 },
);

async function getHtmlContent2(url: string) {
  if (!URL.canParse(url)) {
    return;
  }

  const controller = new AbortController();
  let html, abortTimeout;
  try {
    abortTimeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    const response = await fetch(url, { signal: controller.signal });
    html = await response.text();
  } catch (err) {
    console.error({ error: "Cannot fetch html: " + err, url });
    return;
  }
  clearTimeout(abortTimeout);

  // temp workaround https://github.com/jsdom/jsdom/issues/2005
  return html
    ?.replace(/<style([\S\s]*?)>([\S\s]*?)<\/style>/gim, "")
    ?.replace(/<script([\S\s]*?)>([\S\s]*?)<\/script>/gim, "");
}
