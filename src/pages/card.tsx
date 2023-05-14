import styles from "@/styles/card.module.css";
import { useState } from "react";

type CardProps = {
  title: string;
  url?: string;
  image?: string;
  description?: string;
};

export default function Card(props: CardProps) {
  const { title, url, image, description } = props;

  const source = url && extractSource(url);

  const [embedTweet, setEmbedTweet] = useState();

  if (source === "twitter.com") {
    fetch(`https://publish.twitter.com/oembed?hide_thread=1&omit_script=1&theme=dark&dnt=true&url=${url}`)
      .then((response) => response.json())
      .then((json) => setEmbedTweet(json.html))
      .catch(console.error);
  }

  return embedTweet ? (
    <div dangerouslySetInnerHTML={embedTweet}></div>
  ) : (
    <a href={url} title={url} className={styles.card} target="_blank">
      <div className={styles.imageBox} style={{ backgroundImage: `url(${image})` }}>
        <span className={styles.hostname}>{source}</span>
      </div>
      <div className={styles.textBox}>
        <strong>{title}</strong>
        <div className={styles.description} title={description}>
          {description}
        </div>
      </div>
    </a>
  );
}

function extractSource(url: string) {
  const { hostname, pathname } = new URL(url);
  if (hostname === "github.com") {
    return hostname + takePath(pathname, 3);
  } else if (hostname === "gist.github.com") {
    return hostname + takePath(pathname, 2);
  } else {
    return hostname;
  }
}

function takePath(pathname: string, parts: number) {
  return Array.from(pathname.split("/")).slice(0, parts).join("/");
}
