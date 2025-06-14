import { unstable_cache } from "next/cache";
import Link from "next/link";
import { EmbeddedTweet, TweetNotFound } from "react-tweet";
import { getTweet as _getTweet } from "react-tweet/api";
import { Card } from "./card";
import { Dialog } from "./dialog";
import type { Flags } from "./flags";
import { getHnStory } from "./hn";

export type StoryProps = {
  storyId: number;
  flags: Flags;
};

export async function Story({ storyId, flags }: StoryProps) {
  const hnStory = await getHnStory(storyId);
  if (!hnStory) {
    return null;
  }
  const { title, url, text } = hnStory;

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
  if (url) {
    const { hostname, pathname } = new URL(url);
    if (
      (hostname === "twitter.com" || hostname === "x.com") &&
      pathname.match(/\/status\/\d+/)
    ) {
      tweetId = pathname.split("/").slice(-1)[0];
    }
  }

  const storyLink = (
    <h2 className="flex flex-col justify-between gap-2 md:flex-row">
      {hnLink}
      <Dialog hnStory={hnStory} hnLink={hnLink} flags={flags} />
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
      <div className="h-6 bg-neutral-900/60" />
      <div className="h-36 bg-neutral-900/60" />
    </div>
  );
};
