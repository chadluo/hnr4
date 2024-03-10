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
    `http://localhost:4000/api/story?storyId=${storyId}`
  );
  return { id: storyId, ...(await response.json()) } as HNStory;
}
