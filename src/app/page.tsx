import styles from "@/styles/index.module.css";
import classNames from "classnames";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Story from "./story";

const sans = IBM_Plex_Sans({ weight: ["400", "700"], style: ["normal", "italic"], subsets: ["latin"] });
const mono = IBM_Plex_Mono({ weight: "400", subsets: ["latin"] });

export default async function HomeClient() {
  const response = await fetch(
    `https://hacker-news.firebaseio.com/v0/topstories.json?limitToFirst=30&orderBy="$priority"`
  );
  const stories = ((await response.json()) as number[]).map((id) => `${id}`);

  const title = "Hacker News Reader";

  return (
    <>
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
