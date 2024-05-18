import Comment from "@/app/comment";
import classNames from "classnames";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { EmbeddedTweet, TweetNotFound } from "react-tweet";
import { getTweet as _getTweet } from "react-tweet/api";
import Card from "./card";
import { getHtmlContent } from "./contents";
import { getHnStory } from "./hn";
import { getMeta } from "./meta";
import { Summary } from "./summary";

type Meta = {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  authors?: string;
};

export async function Story({
  storyId,
  full,
  realSummary,
}: {
  storyId: number;
  full: boolean;
  realSummary: boolean;
}) {
  const { title, url, text, kids, type } = await getHnStory(storyId);

  const hnUrl = `https://news.ycombinator.com/item?id=${storyId}`;

  const hnLink = (
    <h2 className="flex flex-row justify-between">
      <Link
        href={hnUrl}
        className="text-base font-bold hover:text-[#f60]"
        target="_blank"
      >
        {title}
      </Link>
      <Link
        href={`/story/${storyId}`}
        className="text-gray-300 hover:text-white"
      >
        <i className="fa-regular fa-comment"></i> {kids?.length ?? 0}
      </Link>
    </h2>
  );

  const discussions = (text ?? kids) && (
    <div className="[&>details:not(:first-of-type)]:border-t [&>details:not(:first-of-type)]:border-neutral-600 [&>details:not(:first-of-type)]:pt-2">
      {text && (
        <div
          className={classNames(
            "[&_a]:break-words [&_a]:text-[#f60] hover:[&_a]:text-[#f0a675]",
            "[&_p]:mt-2",
            "[&_pre]:mb-2 [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:leading-6",
          )}
          dangerouslySetInnerHTML={{ __html: text }}
        ></div>
      )}
      {kids &&
        kids.map((kid) => (
          <Comment key={kid} commentId={kid} isExpanded={false} isTop={true} />
        ))}
    </div>
  );

  let meta: Meta | undefined;
  let tweetId: string | undefined;
  let html;

  if (url) {
    const { hostname, pathname } = new URL(url);
    if (hostname === "twitter.com" || hostname === "x.com") {
      tweetId = pathname.split("/").slice(-1)[0];
    } else {
      html = await getHtmlContent(url);
      if (html != null) {
        meta = await getMeta(html);
      }
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {!full && hnLink}
        {tweetId ? (
          <TweetPage id={tweetId} />
        ) : meta ? (
          <Card
            title={meta.title ?? title}
            url={url ?? hnUrl}
            image={meta.image}
            imageAlt={meta.imageAlt}
            authors={meta.authors}
            description={meta.description ?? text}
          />
        ) : (
          <Card title={title} url={url ?? hnUrl} description={text} />
        )}
      </div>
      {full && url != null && html != null && canSummarize(type, url) && (
        <Summary
          storyId={storyId}
          storyType={type}
          url={url}
          html={html}
          realSummary={process.env.mode !== "dev" || realSummary}
        />
      )}
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

export const StoryPlaceholder = ({ full }: { full?: boolean }) => {
  return (
    <div>
      {!full && (
        <>
          <div className="h-4 bg-neutral-900"></div>
          <div className="h-3"></div>
        </>
      )}
      <div className="h-36 bg-neutral-900"></div>
    </div>
  );
};

function canSummarize(type: string, url: string) {
  if (type === "job") {
    return false;
  }
  const { hostname } = new URL(url);
  if (hostname === "twitter.com" || hostname === "x.com") {
    return false;
  }

  return true;
}
