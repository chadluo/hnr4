"use client";

import Card from "@/app/card";
import Comment from "@/app/comment";
import Footer from "@/app/footer";
import styles from "@/styles/index.module.css";
import storyPage from "@/styles/storyPage.module.css";
import classNames from "classnames";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import React from "react";

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

type Props = { params: { id: string } };

const mono = IBM_Plex_Mono({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
});
const sans = IBM_Plex_Sans({ weight: ["400", "700"], subsets: ["latin"] });

export default function Page({ params }: Props) {
  const [hnStory, setHnStory] = React.useState<HNStory>();
  const [meta, setMeta] = React.useState<Meta>();
  const [summary, setSummary] = React.useState<Summary>({
    short: "",
    long: "",
  });
  const [embedTweet, setEmbedTweet] = React.useState();

  React.useEffect(() => {
    const controller = new AbortController();
    (async (storyId: string) => {
      const hnStory: HNStory = await (
        await fetch(`/api/story?storyId=${storyId}`, {
          signal: controller.signal,
        })
      ).json();
      setHnStory(hnStory);
      if (!hnStory.url) return;
      const { hostname } = new URL(hnStory.url);
      if (hostname === "twitter.com") {
        fetch(`/api/tweet?url=${hnStory.url}`, { signal: controller.signal })
          .then((response) => response.json())
          .then((json) => setEmbedTweet(json.html));
      } else {
        fetch(`/api/meta?url=${hnStory.url}`, { signal: controller.signal })
          .then((response) => response.json())
          .then(setMeta);
        if (hnStory.type !== "job") {
          fetch(`/api/summary?storyId=${storyId}&url=${hnStory.url}`, {
            signal: controller.signal,
          })
            .then((response) => response.json())
            .then(setSummary)
            .catch((error) => {
              console.error(
                `Failed getting summary for [${hnStory.url}]`,
                error
              );
            });
        }
      }
    })(params.id).catch((err) =>
      console.error(`failed fetching story ${params.id}`, err)
    );

    return () => {
      controller.abort();
    };
  }, [params.id]);

  const storyText = hnStory?.text;
  const kids = hnStory?.kids;
  const hnUrl = `https://news.ycombinator.com/item?id=${params.id}`;

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

  return (
    <>
      <style jsx global>{`
        code {
          font-family: ${mono.style.fontFamily};
          font-size: calc(1rem - 2px);
        }
      `}</style>
      <header className={classNames(styles.header, storyPage.header)}>
        <h1 className={storyPage.title}>
          <Link href="/" className={storyPage.back}>
            🡨
          </Link>
          <Link
            href={hnUrl}
            className={classNames(storyPage.hnTitle, sans.className)}
            target="_blank"
          >
            {hnStory?.title}
          </Link>
        </h1>
      </header>
      <section className={classNames(storyPage.article, sans.className)}>
        <div className={storyPage.story}>
          <span className={classNames(storyPage.summary, mono.className)}>
            {summary.long}
          </span>
          {card}
        </div>
        {(storyText || kids) && (
          <div className={storyPage.discussions}>
            {storyText && (
              <div
                className={storyPage.storyText}
                dangerouslySetInnerHTML={{ __html: storyText }}
              ></div>
            )}
            {kids?.map((kid) => (
              <Comment key={kid} commentId={kid.toString()} expand={false} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
