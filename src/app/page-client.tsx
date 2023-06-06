"use client";

import styles from "@/styles/index.module.css";
import classNames from "classnames";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Story from "./story";

const sans = IBM_Plex_Sans({ weight: ["400", "700"], style: ["normal", "italic"], subsets: ["latin"] });
const mono = IBM_Plex_Mono({ weight: "400", subsets: ["latin"] });

export default function HomeClient() {
  const highlight = useSearchParams()?.get("i");

  const [stories, setStories] = useState<string[]>([]);

  useEffect(() => {
    fetch(`https://hacker-news.firebaseio.com/v0/topstories.json?limitToFirst=30&orderBy="$priority"`)
      .then((response) => response.json())
      .then((json: number[]) => {
        const stories = json.map((id) => `${id}`);
        if (highlight && !stories.includes(highlight)) {
          stories.pop();
          stories.unshift(highlight);
        }
        return setStories(stories);
      });
  }, [highlight]);

  useEffect(() => {
    const [deg1, hue1] = [Math.random() * 360, Math.random() * 360];
    const [deg2, hue2] = [Math.random() * 360, Math.random() * 360];
    document.body.style.background = [
      `linear-gradient(${deg1}deg, hsl(${hue1} 80% 20%), 20%, rgba(0, 0, 0, 0))`,
      `linear-gradient(${deg2}deg, hsl(${hue2} 80% 20%), 20%, rgba(0, 0, 0, 0))`,
      "black",
    ].join(",");
  }, []);

  const title = "Hacker News Reader";
  const image = "https://hnr.adluo.ch/hnr.png";
  const description = "Yet another Hacker News Reader with metadata cards and some LLM summaries.";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={title} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content={image} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="https://hnr.adluo.ch" />
      </Head>
      <header className={classNames(styles.header, mono.className)}>
        <span>{title}</span>
      </header>
      <main className={classNames(styles.main, sans.className)}>
        {stories.map((story) => (
          <Story storyId={story} key={story} />
        ))}
      </main>
      <footer className={classNames(styles.footer, mono.className)}>
        <a href="https://github.com/chadluo/hnr4">chadluo/hnr4</a>
        <a href="https://github.com/sponsors/chadluo">sponsor</a>
      </footer>
    </>
  );
}
