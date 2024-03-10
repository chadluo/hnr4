"use client";

import styles from "@/styles/story.module.css";
import classNames from "classnames";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "./card";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

type StoryProps = {
  storyId: string;
};

type HNStory = {
  url?: string;
  title: string;
  text?: string;
  kids: number[];
  type: "job" | "story" | "comment" | "poll" | "pollopt";
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

export default function Story(props: StoryProps) {
  const { storyId } = props;

  const highlight = useSearchParams()?.get("i");

  const [hnStory, setHnStory] = useState<HNStory>();
  const [meta, setMeta] = useState<Meta>();
  const [summary, setSummary] = useState<Summary>({ short: "", long: "" });
  const [embedTweet, setEmbedTweet] = useState();

  useEffect(() => {
    const controller = new AbortController();
    (async (storyId: string) => {
      const hnStory: HNStory = await getHnStory(controller, storyId);
      setHnStory(hnStory);
      if (!hnStory.url) return;
      const { hostname } = new URL(hnStory.url);
      if (hostname === "twitter.com") {
        fetch(`/api/tweet?url=${hnStory.url}`, { signal: controller.signal })
          .then((response) => response.json())
          .then((json) => setEmbedTweet(json.html));
      } else {
        setMeta(await getMeta(controller, hnStory.url));
        if (hnStory.type !== "job") {
          setSummary(await getSummary(controller, storyId, hnStory.url));
        }
      }
    })(storyId).catch((err) =>
      console.error(`failed fetching story ${storyId}`, err)
    );

    return () => {
      controller.abort();
    };
  }, [storyId, highlight]);

  const hnUrl = `https://news.ycombinator.com/item?id=${storyId}`;

  const card =
    hnStory &&
    (embedTweet ? (
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      <div dangerouslySetInnerHTML={{ __html: embedTweet }} />
    ) : meta ? (
      <Card
        title={meta.title || hnStory.title}
        url={hnStory.url || hnUrl}
        image={meta.image}
        authors={meta.authors}
        description={meta.description}
      />
    ) : (
      <Card title={hnStory.title} url={hnStory.url || hnUrl} />
    ));

  const { short } = summary;

  return hnStory ? (
    <div className={styles.story}>
      <div className={styles.storyInfo}>
        <h2>
          <Link
            href={hnUrl}
            className={classNames(styles.hnTitle, sans)}
            target="_blank"
          >
            {hnStory.title}
          </Link>
        </h2>
        <span className={classNames(mono.className, styles.shortSummarization)}>
          {short}
        </span>
        <Link href={`/story/${storyId}`} className={styles.link}>
          {hnStory.kids?.length || 0} discussions
        </Link>
      </div>
      {card}
    </div>
  ) : (
    <center data-storyid={storyId}>Loading</center>
  );
}

async function getHnStory(controller: AbortController, storyId: string) {
  return (await (
    await fetch(`/api/story?storyId=${storyId}`, { signal: controller.signal })
  ).json()) as HNStory;
}

async function getMeta(controller: AbortController, url: string) {
  return (await (
    await fetch(`/api/meta?url=${url}`, { signal: controller.signal })
  ).json()) as Meta;
}

async function getSummary(
  controller: AbortController,
  storyId: string,
  url: string
) {
  return (await (
    await fetch(`/api/summary?storyId=${storyId}&url=${url}`, {
      signal: controller.signal,
    })
  ).json()) as Summary;
}
