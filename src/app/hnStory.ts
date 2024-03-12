export type HNStory = {
  id: number;
  title: string;
  url?: string;
  text?: string;
  kids: number[];
  type: "job" | "story" | "comment" | "poll" | "pollopt";
};

export async function getHnStory(storyId: number) {
  const response = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${storyId}.json`
  );
  return { id: storyId, ...(await response.json()) } as HNStory;
}
