import styles from "@/styles/story.module.css";
import { mono, sans } from "@/styles/typography";
import classNames from "classnames";
import Link from "next/link";
import Card from "./card";

type StoryProps = {
  storyId: number;
  title: string;
  url: string | undefined;
  text: string | undefined;
  kids: number[];
  type: "job" | "story" | "comment" | "poll" | "pollopt";
  longSummary: boolean;
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
  const { storyId, title, url, text, kids, type, longSummary } = props;

  if (!url) return <>no url {storyId}</>;

  let meta: Meta | undefined, summary: Summary | undefined, embedTweet;
  const { hostname } = new URL(url);
  if (hostname === "twitter.com") {
    const response = await (
      await fetch(`http://localhost:4000/api/tweet?url=${url}`)
    ).json();
    embedTweet = response.html;
  } else {
    meta = await getMeta(url);
    if (type !== "job") {
      summary = await getSummary(storyId, url);
    }
  }

  const hnUrl = `https://news.ycombinator.com/item?id=${storyId}`;

  const card = embedTweet ? (
    <div dangerouslySetInnerHTML={{ __html: embedTweet }} />
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
  );

  return (
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
            {longSummary ? summary.long : summary.short}
          </span>
        )}
        <Link href={`/story/${storyId}`} className={styles.link}>
          {kids?.length || 0} discussions
        </Link>
      </div>
      {card}
    </div>
  );
}

async function getMeta(url: string) {
  return (await (
    await fetch(`http://localhost:4000/api/meta?url=${url}`)
  ).json()) as Meta;
}

async function getSummary(storyId: number, url: string) {
  return (await (
    await fetch(
      `http://localhost:4000/api/summary?storyId=${storyId}&url=${url}`
    )
  ).json()) as Summary;
}
