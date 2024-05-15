const DEFAULT_TIMEOUT_MS = 5000;

export async function getHtmlContent(url: string): Promise<string | undefined> {
  try {
    new URL(url);
  } catch (err) {
    return;
  }

  const controller = new AbortController();
  let html, abortTimeout;
  try {
    abortTimeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    html = await fetch(url, { signal: controller.signal }).then((response) =>
      response.text(),
    );
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
