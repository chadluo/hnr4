const DEFAULT_TIMEOUT_MS = 5000;

export const getHtmlContent = async (url: string) => {
  if (!URL.canParse(url)) {
    return;
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
