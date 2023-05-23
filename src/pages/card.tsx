import styles from "@/styles/card.module.css";
import classNames from "classnames";

export type CardDirection = "horizontal" | "vertical";

type CardProps = {
  dir: CardDirection;
  title: string;
  url?: string;
  image?: string;
  authors?: string;
  description?: string;
};

export default function Card(props: CardProps) {
  const { dir, title, url, image, authors, description } = props;

  const source = authors ? authors : url && extractSource(url);

  return (
    <a
      href={url}
      title={url}
      className={classNames(styles.card, {
        [styles.imageCard]: image,
        [styles.vertical]: dir === "vertical",
        [styles.horizontal]: dir === "horizontal",
      })}
      target="_blank"
    >
      <div className={styles.textBox}>
        <span className={styles.source} title={source}>
          {source}
        </span>
        <span className={styles.title}>{title}</span>
        <div className={styles.description} title={description}>
          {description}
        </div>
      </div>
      {image && <div className={styles.imageBox} style={{ backgroundImage: `url(${image})` }}></div>}
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
