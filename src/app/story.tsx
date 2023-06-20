"use client";

import styles from "@/styles/story.module.css";
import classNames from "classnames";
import { IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "./card";

const monoFont = IBM_Plex_Mono({ subsets: ["latin"], weight: "400", style: "italic" });

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
      const hnStory: HNStory = await (
        await fetch(`/api/story?storyId=${storyId}`, { signal: controller.signal })
      ).json();
      setHnStory(hnStory);
      if (!hnStory.url) return;
      const { hostname } = new URL(hnStory.url);
      if (hostname === "twitter.com") {
        fetch(`/api/tweet?url=${hnStory.url}`, { signal: controller.signal })
          .then(response => response.json())
          .then(json => setEmbedTweet(json.html));
      } else {
        fetch(`/api/meta?url=${hnStory.url}`, { signal: controller.signal })
          .then((response) => response.json())
          .then(setMeta);
        if (hnStory.type !== "job") {
          fetch(`/api/summary?storyId=${storyId}&url=${hnStory.url}`, { signal: controller.signal })
            .then((response) => response.json())
            .then(setSummary)
            .catch((error) => {
              console.error(`Failed getting summary for [${hnStory.url}]`, error);
            });
        }
      }
    })(storyId).catch((err) => console.error(`failed fetching story ${storyId}`, err));

    return () => {
      controller.abort();
    };
  }, [storyId, highlight]);

  const hnUrl = `https://news.ycombinator.com/item?id=${storyId}`;

  const card =
    hnStory &&
    (embedTweet ? (
      <div dangerouslySetInnerHTML={{ __html: embedTweet }}></div>
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

  const { short, long } = summary;

  return hnStory ? (
    <Link href={`/story/${storyId}`} className={styles.story} >
      <div className={styles.storyInfo}>
        <a href={hnUrl} className={styles.hnTitle} target="_blank">
          {hnStory.title}
        </a>
        <span className={classNames(monoFont.className, styles.shortSummarization)}>{short}</span>
      </div>
      {card}
    </Link>
  ) : (
    <center data-storyid={storyId}>Loading</center>
  );
}
