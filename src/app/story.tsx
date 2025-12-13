import { unstable_cache } from "next/cache";
import Link from "next/link";
import * as React from "react";
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

  let tweetId: string | undefined;
  let youtubeId: string | undefined;
  if (url) {
    const { hostname, pathname, searchParams } = new URL(url);
    if (
      (hostname === "twitter.com" || hostname === "x.com") &&
      pathname.match(/\/status\/\d+/)
    ) {
      tweetId = pathname.split("/").slice(-1)[0];
    } else if (hostname.endsWith("youtube.com")) {
      youtubeId = searchParams.get("v") ?? undefined;
    }
  }

  const storyLink = (
    <h2 className="flex flex-col justify-between gap-2 text-sm md:flex-row md:text-base">
      <Link
        href={hnUrl}
        className="font-bold hover:text-[#f60]"
        target="_blank"
      >
        {title}
      </Link>
      <Dialog hnStory={hnStory} flags={flags} />
    </h2>
  );

  return (
    <>
      <div className="flex flex-col gap-3">
        {storyLink}
        {tweetId ? (
          <TweetPage id={tweetId} />
        ) : youtubeId ? (
          <YoutubePlayer title={title} youtubeId={youtubeId} />
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

const YoutubePlayer = ({
  title,
  youtubeId,
}: {
  title: string;
  youtubeId: string;
}) => (
  <div className="aspect-video max-w-2xl">
    <iframe
      title={title}
      width="100%"
      height="100%"
      src={`https://www.youtube.com/embed/${youtubeId}`}
    />
  </div>
);
