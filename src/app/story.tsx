import Comment from "@/app/comment";
import comment from "@/styles/comment.module.css";
import styles from "@/styles/story.module.css";
import storyPage from "@/styles/storyPage.module.css";
import { mono, sans } from "@/styles/typography";
import classNames from "classnames";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
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

  let storyBody;

  const discussions = (text || kids) && (
    <div
      className={classNames(
        storyPage.discussions,
        mono.variable,
        sans.variable
      )}
    >
      {text && (
        <div
          className={comment.comment}
          dangerouslySetInnerHTML={{ __html: text }}
        ></div>
      )}
      {kids?.map((kid) => (
        <Comment key={kid} commentId={kid} expand={false} />
      ))}
    </div>
  );

  if (!url) {
    storyBody = (
      <div className={styles.story}>
        <div className={styles.storyInfo}>
          <h2>
            <Link
              href={hnUrl}
              className={classNames(styles.hnTitle, sans)}
              target="_blank"
            >
              {title}
            </Link>
          </h2>
          <Link href={`/story/${storyId}`} className={styles.link}>
            {kids?.length || 0} discussions
          </Link>
        </div>
        <Card title={title} url={hnUrl} description={text} />
      </div>
    );

    return full ? (
      <section className={classNames(storyPage.article, sans.className)}>
        {storyBody}
        {discussions}
      </section>
    ) : (
      <>{storyBody}</>
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

  const card = tweetId ? (
    <TweetPage id={tweetId} />
  ) : meta ? (
    <Suspense>
      <Card
        title={meta.title || title}
        url={url || hnUrl}
        image={meta.image}
        authors={meta.authors}
        description={meta.description}
      />
    </Suspense>
  ) : (
    <Card title={title} url={url || hnUrl} />
  );

  storyBody = (
    <div className={styles.story}>
      <div className={styles.storyInfo}>
        <h2>
          <Link
            href={hnUrl}
            className={classNames(styles.hnTitle, sans)}
            target="_blank"
          >
            {title}
          </Link>
        </h2>
        {summary != null && (
          <span
            className={classNames(mono.className, styles.shortSummarization)}
          >
            {full ? summary.long : summary.short}
          </span>
        )}
        {!full && (
          <Link href={`/story/${storyId}`} className={styles.link}>
            {kids?.length || 0} discussions
          </Link>
        )}
      </div>
      {card}
    </div>
  );

  return full ? (
    <section className={classNames(storyPage.article, sans.className)}>
      {storyBody}
      {discussions}
    </section>
  ) : (
    <>{storyBody}</>
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
