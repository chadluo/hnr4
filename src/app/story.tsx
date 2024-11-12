import { unstable_cache } from "next/cache";
import Link from "next/link";
import { EmbeddedTweet, TweetNotFound } from "react-tweet";
import { getTweet as _getTweet } from "react-tweet/api";
import { Card } from "./card";
import { Dialog } from "./dialog";
import type { Flags } from "./flags";
import { getHnStory } from "./hn";

const noVisitWebsiteHostnames = [
  "www.bloomberg.com",
  "www.reuters.com",
  "www.washingtonpost.com",
];

export type StoryProps = {
  storyId: number;
  openaiModel: string;
  flags: Flags;
};

export async function Story({ storyId, openaiModel, flags }: StoryProps) {
  const hnStory = await getHnStory(storyId);
  if (!hnStory) {
    return null;
  }
  const { title, url, text, kids, type } = hnStory;

  const hnUrl = `https://news.ycombinator.com/item?id=${storyId}`;

  const hnLink = (
    <Link
      href={hnUrl}
      className="text-base font-bold hover:text-[#f60]"
      target="_blank"
    >
      {title}
    </Link>
  );

  let tweetId: string | undefined;
  let canVisit = false;
  if (url) {
    const { hostname, pathname } = new URL(url);
    if (hostname === "twitter.com" || hostname === "x.com") {
      tweetId = pathname.split("/").slice(-1)[0];
    }
    canVisit = !noVisitWebsiteHostnames.includes(new URL(url).hostname);
  }

  const storyLink = (
    <h2 className="flex flex-col justify-between gap-2 md:flex-row">
      {hnLink}
      <Dialog
        kids={kids}
        text={text}
        storyId={storyId}
        storyType={type}
        url={url}
        hnLink={hnLink}
        openaiModel={openaiModel}
        canVisit={canVisit}
        flags={flags}
      />
    </h2>
  );

  return (
    <>
      <div className="flex flex-col gap-3">
        {storyLink}
        {tweetId ? (
          <TweetPage id={tweetId} />
        ) : (
          <Card
            storyId={storyId}
            url={url}
            hnTitle={title}
            hnUrl={hnUrl}
            hnText={text}
            canVisit={canVisit}
          />
        )}
      </div>
    </>
  );
}

const getTweet = unstable_cache(
  async (id: string) => _getTweet(id),
  ["tweet"],
  { revalidate: 3600 * 24 },
);

const TweetPage = async ({ id }: { id: string }) => {
  try {
    const tweet = await getTweet(id);
    return tweet ? <EmbeddedTweet tweet={tweet} /> : <TweetNotFound />;
  } catch (error) {
    console.error(error);
    return <TweetNotFound error={error} />;
  }
};

export const StoryPlaceholder = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-6 bg-neutral-900/60"></div>
      <div className="h-36 bg-neutral-900/60"></div>
    </div>
  );
};
