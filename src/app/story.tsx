import Comment from "@/app/comment";
import comment from "@/styles/comment.module.css";
import styles from "@/styles/story.module.css";
import { mono, sans } from "@/styles/typography";
import classNames from "classnames";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { EmbeddedTweet, TweetNotFound } from "react-tweet";
import { getTweet as _getTweet } from "react-tweet/api";
import Card from "./card";
import { getHnStory } from "./hnStory";
import { getMeta } from "./meta";

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

type Summary = {
  short: string;
  long: string;
};

export default async function Story(props: StoryProps) {
  const { storyId, full } = props;
  const { title, url, text, kids, type } = await getHnStory(storyId);

  const hnUrl = `https://news.ycombinator.com/item?id=${storyId}`;

  const hnLink = (
    <h2>
      <Link
        href={hnUrl}
        className={classNames(styles.hnTitle, sans, 'font-bold')}
        target="_blank"
      >
        {title}
      </Link>
    </h2>
  );

  const discussions = (text || kids) && (
    <div
      className={classNames(styles.discussions, mono.variable, sans.variable)}
    >
      {text && (
        <div
          className={comment.comment}
          dangerouslySetInnerHTML={{ __html: text }}
        ></div>
      )}
      {kids &&
        kids.map((kid) => <Comment key={kid} commentId={kid} expand={false} />)}
    </div>
  );

  if (!url) {
    return (
      <>
        <div className={classNames("grid", "lg:grid-cols-8", "gap-4")}>
          <div className={classNames("flex", "flex-col", "lg:col-span-3")}>
            {!full && hnLink}
            <Link
              href={`/story/${storyId}`}
              className={classNames("text-gray-300", "hover:text-white")}
            >
              {kids?.length || 0} discussion
            </Link>
          </div>
          <Card title={title} url={hnUrl} description={text} />
        </div>
        {full && discussions}
      </>
    );
  }

  let meta: Meta | undefined, summary: Summary | undefined;
  const { hostname, pathname } = new URL(url);

  let tweetId;
  if (hostname === "twitter.com") {
    tweetId = pathname.split("/").slice(-1)[0];
  } else {
    meta = await getMeta(url);
    if (type !== "job") {
      summary = await getSummary(storyId, url);
    }
  }

  const card = (
    <div className={classNames("lg:col-span-5")}>
      {tweetId ? (
        <TweetPage id={tweetId} />
      ) : meta ? (
        <Card
          title={meta.title || title}
          url={url || hnUrl}
          image={meta.image}
          authors={meta.authors}
          description={meta.description}
        />
      ) : (
        <Card title={title} url={url || hnUrl} />
      )}
    </div>
  );
  return (
    <>
      <div className={classNames("grid", "lg:grid-cols-8", "gap-4")}>
        <div className={classNames("flex", "flex-col", "lg:col-span-3")}>
          {!full && hnLink}
          {summary != null && (
            <span className={classNames(mono.className, styles.summary)}>
              {full ? summary.long : summary.short}
            </span>
          )}
          {!full && (
            <Link
              href={`/story/${storyId}`}
              className={classNames("text-gray-300", "hover:text-white")}
            >
              {kids?.length || 0} discussions
            </Link>
          )}
        </div>
        {card}
      </div>
      {full && discussions}
    </>
  );
}

async function getSummary(storyId: number, url: string) {
  return (await (
    await fetch(`${process.env.HOST}/api/summary?storyId=${storyId}&url=${url}`)
  ).json()) as Summary;
}

const getTweet = unstable_cache(
  async (id: string) => _getTweet(id),
  ["tweet"],
  { revalidate: 3600 * 24 }
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
