import styles from "@/styles/story.module.css";
import classNames from "classnames";
import { IBM_Plex_Mono } from "next/font/google";
import { useSearchParams } from "next/navigation";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import Card from "./card";
import Dialog from "./dialog";

const monoFont = IBM_Plex_Mono({ subsets: ["latin"], weight: "400", style: "italic" });

type StoryProps = {
  storyId: string;
};

type HNStory = {
  url: string;
  title: string;
  kids: number[];
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
    (async (storyId: string) => {
      const hnStory: HNStory = await (await fetch(`/api/story?storyId=${storyId}`)).json();
      setHnStory(hnStory);
      if (storyId === highlight) {
        showDialog();
      }
      const { hostname } = new URL(hnStory.url);
      if (hostname === "twitter.com") {
        setEmbedTweet((await (await fetch(`/api/tweet?url=${hnStory.url}`)).json()).html);
      } else {
        const [meta, summary] = await Promise.all([
          await (await fetch(`/api/meta?url=${hnStory.url}`)).json(),
          await (await fetch(`/api/summary?storyId=${storyId}&url=${hnStory.url}`)).json(),
        ]);
        setMeta(meta);
        setSummary(summary);
      }
    })(storyId).catch(console.error);

    return () => {};
  }, [storyId, showDialog, highlight]);

  const card = () =>
    hnStory &&
    (embedTweet ? (
      <div dangerouslySetInnerHTML={{ __html: embedTweet }}></div>
    ) : meta ? (
      <Card title={meta.title || hnStory.title} url={hnStory.url} image={meta.image} description={meta.description} />
    ) : (
      <Card title={hnStory.title} url={hnStory.url} />
    ));

  const text = summary?.text;
  const [shortSummarization, longSummarization] = (text && text.split("|")) || [undefined, undefined];

  return hnStory ? (
    <div className={styles.story} data-storyid={storyId} onClick={showDialog}>
      <a href={`https://news.ycombinator.com/item?id=${storyId}`} className={styles.hnTitle} target="_blank">
        {hnStory.title}
      </a>
      {card()}
      <span className={classNames(monoFont.className, styles.shortSummarization)}>{shortSummarization}</span>
      <Dialog
        ref={dialogRef}
        onClickClose={closeDialog}
        showKids={() => showKids}
        storyId={storyId}
        title={hnStory.title}
        card={card}
        longSummarization={longSummarization}
        kids={hnStory.kids}
      />
    </div>
  ) : (
    <center data-storyid={storyId}>Loading</center>
  );
}
