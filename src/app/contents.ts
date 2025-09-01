"use server";

import { canVisit } from "./can_visit";

const DEFAULT_TIMEOUT_MS = 5000;

export const getHtmlContent = async (url: string) => {
  "use cache";

  if (!(await canVisit(url))) {
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
