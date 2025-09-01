const noVisitWebsiteHostnames = [
  "bloomberg.com",
  "economist.com",
  "ft.com",
  "reddit.com",
  "reuters.com",
  "telegraph.co.uk",
  "washingtonpost.com",
  "wsj.com",
];

export const canVisit = async (url: string) => {
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
