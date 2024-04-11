import Comment from "@/app/comment";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { EmbeddedTweet, TweetNotFound } from "react-tweet";
import { getTweet as _getTweet } from "react-tweet/api";
import Card from "./card";
import { getHnStory } from "./hn";
import { getMeta } from "./meta";
import { Summary } from "./summary";

type StoryProps = {
  storyId: number;
  full: boolean;
};

type Meta = {
  title?: string;
  description?: string;
  image?: string;
  authors?: string;
};

export default async function Story(props: StoryProps) {
  const { storyId, full } = props;
  const { title, url, text, kids, type } = await getHnStory(storyId);

  const hnUrl = `https://news.ycombinator.com/item?id=${storyId}`;

  const hnLink = (
    <h2>
      <Link
        href={hnUrl}
        className="text-base font-bold hover:text-[#f60]"
        target="_blank"
      >
        {title}
      </Link>
    </h2>
  );

  const discussionsCount = (
    <Link href={`/story/${storyId}`} className="text-gray-300 hover:text-white">
      <i className="fa-regular fa-comment"></i> {kids?.length || 0}
    </Link>
  );

  const discussions = (text || kids) && (
    <div className="mx-auto max-w-4xl [&>details:not(:first-of-type)]:border-t [&>details:not(:first-of-type)]:border-neutral-600 [&>details:not(:first-of-type)]:pt-2">
      {text && <div dangerouslySetInnerHTML={{ __html: text }}></div>}
      {kids &&
        kids.map((kid) => (
          <Comment key={kid} commentId={kid} isExpanded={false} isTop={true} />
        ))}
    </div>
  );

  let meta: Meta | undefined;
  let tweetId;

  if (url) {
    const { hostname, pathname } = new URL(url);
    if (hostname === "twitter.com") {
      tweetId = pathname.split("/").slice(-1)[0];
    } else {
      meta = await getMeta(url);
    }
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-8">
        <div className="flex flex-col lg:col-span-3">
          {!full && hnLink}
          {full && <Summary storyId={storyId} storyType={type} url={url} />}
          {!full && discussionsCount}
        </div>
        <div className="lg:col-span-5">
          <Suspense fallback={<div className="h-36 bg-neutral-900"></div>}>
            {tweetId ? (
              <TweetPage id={tweetId} />
            ) : meta ? (
              <Card
                title={meta.title || title}
                url={url || hnUrl}
                image={meta.image}
                authors={meta.authors}
                description={meta.description || text}
              />
            ) : (
              <Card title={title} url={url || hnUrl} description={text} />
            )}
          </Suspense>
        </div>
      </div>
      {full && discussions}
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
