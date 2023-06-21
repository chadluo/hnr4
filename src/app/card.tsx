"use client";

import styles from "@/styles/card.module.css";
import classNames from "classnames";
import Link from "next/link";

type CardProps = {
  title: string;
  url: string;
  image?: string;
  authors?: string;
  description?: string;
};

export default function Card(props: CardProps) {
  const { title, url, image, authors, description } = props;

  const source = authors ? authors : url && extractSource(url);

  return (
    <Link href={url} title={url} className={classNames(styles.card, { [styles.imageCard]: image })} target="_blank" >
      <div className={styles.textBox}>
        <span className={styles.source} title={url}>
          {source}
        </span>
        <span className={styles.title}>{title}</span>
        <div className={styles.description} title={description}>
          {description}
        </div>
      </div>
      {image && <div className={styles.imageBox} style={{ backgroundImage: `url(${image})` }}></div>}
    </Link>
  );
}

function extractSource(url: string) {
  const { hostname, pathname } = new URL(url);
  if (hostname === "github.com" || hostname.includes("reddit.com")) {
    return takePath(pathname, 3);
  } else if (hostname === "gist.github.com") {
    return hostname + takePath(pathname, 2);
  } else {
    return hostname.replace(/^www\./, "");
  }
}

function takePath(pathname: string, parts: number) {
  return Array.from(pathname.split("/")).slice(0, parts).join("/");
}
