import styles from "@/styles/story.module.css";
import classNames from "classnames";
import { IBM_Plex_Mono } from "next/font/google";
import { useSearchParams } from "next/navigation";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import Card, { CardDirection } from "./card";
import Dialog from "./dialog";

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
};

type Summary = {
  text?: `${string}/${string}`;
};

export default function Story(props: StoryProps) {
  const { storyId } = props;

  const highlight = useSearchParams().get("i");

  const [hnStory, setHnStory] = useState<HNStory>();
  const [meta, setMeta] = useState<Meta>();
  const [summary, setSummary] = useState<Summary>();
  const [embedTweet, setEmbedTweet] = useState();

  const [showKids, setShowKids] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const showDialog = useCallback((event?: MouseEvent) => {
    if (event && (event.target as Element).closest("a")) return;
    !dialogRef.current?.hasAttribute("open") && dialogRef.current?.showModal();
    setShowKids(true);
  }, []);

  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
  }, []);

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
        setEmbedTweet(
          (await (await fetch(`/api/tweet?url=${hnStory.url}`, { signal: controller.signal })).json()).html
        );
      } else {
        fetch(`/api/meta?url=${hnStory.url}`, { signal: controller.signal })
          .then((response) => response.json())
          .then(setMeta);
        if (hnStory.type !== "job") {
          fetch(`/api/summary?storyId=${storyId}&url=${hnStory.url}`, { signal: controller.signal })
            .then((response) => response.json())
            .then(setSummary);
        }
      }
    })(storyId).catch((err) => console.error(`failed fetching story ${storyId}`, err));

    if (storyId === highlight) {
      showDialog();
    }

    return () => {
      controller.abort();
    };
  }, [storyId, showDialog, highlight]);

  const hnUrl = `https://news.ycombinator.com/item?id=${storyId}`;

  const card = (dir: CardDirection) =>
    hnStory &&
    (embedTweet ? (
      <div dangerouslySetInnerHTML={{ __html: embedTweet }}></div>
    ) : meta ? (
      <Card
        dir={dir}
        title={meta.title || hnStory.title}
        url={hnStory.url || hnUrl}
        image={meta.image}
        description={meta.description}
      />
    ) : (
      <Card dir={dir} title={hnStory.title} url={hnStory.url || hnUrl} />
    ));

  const text = summary?.text;
  const [shortSummarization, longSummarization] = (text && text.split("|")) || [undefined, undefined];

  return hnStory ? (
    <div className={styles.story} data-storyid={storyId} onClick={showDialog}>
      <div className={styles.storyInfo}>
        <a href={hnUrl} className={styles.hnTitle} target="_blank">
          {hnStory.title}
        </a>
        <span className={classNames(monoFont.className, styles.shortSummarization)}>{shortSummarization}</span>
      </div>
      {card("horizontal")}
      <Dialog
        ref={dialogRef}
        onClickClose={closeDialog}
        showKids={() => showKids}
        storyId={storyId}
        title={hnStory.title}
        card={() => card("vertical")}
        longSummarization={longSummarization}
        storyText={hnStory.text}
        kids={hnStory.kids}
      />
    </div>
  ) : (
    <center data-storyid={storyId}>Loading</center>
  );
}
