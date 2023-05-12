import styles from "@/styles/index.module.css";
import { Nunito_Sans } from "next/font/google";
import Head from "next/head";
import { useEffect, useState } from "react";
import Story from "./story";

const nunitoSans = Nunito_Sans({ subsets: ["latin"] });

export default function Home() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetch(`https://hacker-news.firebaseio.com/v0/topstories.json?limitToFirst=30&orderBy="$priority"`)
      .then((response) => response.json())
      .then((json) => setStories(json));
  }, []);

  useEffect(() => {
    const [deg1, hue1] = [Math.random() * 360, Math.random() * 360];
    const [deg2, hue2] = [Math.random() * 360, Math.random() * 360];
    document.body.style.background = [
      `linear-gradient(${deg1}deg, hsl(${hue1} 80% 20%), 10%, rgba(0, 0, 0, 0))`,
      `linear-gradient(${deg2}deg, hsl(${hue2} 80% 20%), 10%, rgba(0, 0, 0, 0))`,
      "black",
    ].join(",");
  }, []);

  return (
    <>
      <Head>
        <title>Hacker News Reader</title>
        <meta name="description" content="Hacker News Reader " />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header className={`${styles.header} ${nunitoSans.className}`}>
        <span>Hacker News Reader</span>
        <a href="https://github.com/chadluo/hnr4">chadluo/hnr4</a>
      </header>
      <main className={`${styles.main} ${nunitoSans.className}`}>
        {stories.map((story) => (
          <Story storyId={story} key={story} />
        ))}
      </main>
    </>
  );
}
