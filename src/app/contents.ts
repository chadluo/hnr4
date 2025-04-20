const DEFAULT_TIMEOUT_MS = 5000;

const noVisitWebsiteHostnames = [
  "bloomberg.com",
  "reddit.com",
  "reuters.com",
  "washingtonpost.com",
];

export const canVisit = (url: string) => {
  if (!URL.canParse(url)) {
    return false;
  }

  if (url.endsWith(".pdf") || url.endsWith(".mp4")) {
    return false;
  }

  const hostname = new URL(url).hostname;
  if (noVisitWebsiteHostnames.some((h) => hostname.includes(h))) {
    return false;
  }

  return true;
};

export const getHtmlContent = async (url: string) => {
  if (!canVisit(url)) {
    return null;
  }

  const controller = new AbortController();
  const abortTimeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  return fetch(url, { signal: controller.signal, next: { revalidate: 3600 } })
    .then((response) => response.text())
    .catch((err) => {
      console.error({ message: "Cannot fetch html", url, err });
      return null;
    })
    .finally(() => {
      clearTimeout(abortTimeout);
    });
};
