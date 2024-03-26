const HN_ENDPOINT = "https://hacker-news.firebaseio.com/v0";

type HNStory = {
  id: number;
  title: string;
  url?: string;
  text?: string;
  kids: number[];
  type: "job" | "story" | "comment" | "poll" | "pollopt";
};

export type HNComment = {
  text: string;
  by: string;
  kids: number[] | undefined;
  deleted: boolean | undefined;
  dead: boolean | undefined;
};

export async function getHNTopStories() {
  const response = await fetch(
    `${HN_ENDPOINT}/topstories.json?limitToFirst=30&orderBy="$priority"`,
    { cache: "no-store" },
  );
  return (await response.json()) as number[];
}

export async function getHnStory(storyId: number) {
  const response = await fetch(`${HN_ENDPOINT}/item/${storyId}.json`, {
    cache: "no-store",
  });
  return { id: storyId, ...(await response.json()) } as HNStory;
}

export async function getHNComment(
  commentId: number,
  abortController: AbortController,
) {
  const response = await fetch(`${HN_ENDPOINT}/item/${commentId}.json`, {
    cache: "no-store",
    signal: abortController.signal,
  });
  return (await response.json()) as HNComment;
}
