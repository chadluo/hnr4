import styles from "@/styles/story.module.css";
import { IBM_Plex_Mono } from "next/font/google";
import { MouseEvent, useEffect, useRef, useState } from "react";
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

  const [hnStory, setHnStory] = useState<HNStory>();
  const [meta, setMeta] = useState<Meta>();
  const [summary, setSummary] = useState<Summary>();

  useEffect(() => {
    (async (storyId: string) => {
      const hnStory: HNStory = await (await fetch(`/api/story?storyId=${storyId}`)).json();
      setHnStory(hnStory);
      const [meta, summary] = await Promise.all([
        await (await fetch(`/api/meta?url=${hnStory.url}`)).json(),
        await (await fetch(`/api/summary?url=${hnStory.url}`)).json(),
      ]);
      setMeta(meta);
      setSummary(summary);
    })(storyId).catch(console.error);

    return () => {};
  }, [storyId]);

  const [showKids, setShowKids] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  function showDialog(event: MouseEvent) {
    if ((event.target as Element).closest("a")) return;
    !dialogRef.current?.hasAttribute("open") && dialogRef.current?.showModal();
    setShowKids(true);
  }
  function closeDialog() {
    dialogRef.current?.close();
    setShowKids(false);
  }

  const card = () =>
    hnStory &&
    (meta ? (
      <Card title={meta.title || hnStory.title} url={hnStory.url} image={meta.image} description={meta.description} />
    ) : (
      <Card title={hnStory.title} url={hnStory.url} />
    ));

  const text = summary?.text;
  const [shortSummarization, longSummarization] = (text && text.split("/")) || [undefined, undefined];

  return hnStory ? (
    <div className={styles.story} data-storyid={storyId} onClick={showDialog}>
      <a href={`https://news.ycombinator.com/item?id=${storyId}`} className={styles.hnTitle} target="_blank">
        {hnStory.title}
      </a>
      {card()}
      <span className={`${monoFont.className} ${styles.shortSummarization}`}>{shortSummarization}</span>
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
