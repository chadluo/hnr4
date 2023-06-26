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

export type Website = "apple" | "github" | "reddit" | "wikipedia" | "youtube";

export default function Card(props: CardProps) {
  const { title, url, image, authors, description } = props;

  const source = authors ? authors : url && extractSource(url);
  const website = findWebsite(url);
  const icon = website ? (
    <>
      {" "}
      <i className={classNames("fa", `fa-${mapIcon(website)}`)}></i>{" "}
    </>
  ) : undefined;

  return (
    <Link
      href={url}
      title={url}
      className={classNames(styles.card, { [styles.imageCard]: image })}
      target="_blank"
    >
      <div className={styles.textBox}>
        <span className={styles.source} title={url}>
          {icon}
          {source}
        </span>
        <span className={styles.title}>{title}</span>
        <div className={styles.description} title={description}>
          {description}
        </div>
      </div>
      {image && (
        <div
          className={styles.imageBox}
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      )}
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

function findWebsite(url: string): Website | undefined {
  const { hostname } = new URL(url);
  if (hostname.endsWith("apple.com")) {
    return "apple";
  } else if (hostname.endsWith("github.com")) {
    return "github";
  } else if (hostname.endsWith("reddit.com")) {
    return "reddit";
  } else if (hostname.endsWith("wikipedia.org")) {
    return "wikipedia";
  } else if (hostname.endsWith("youtube.com")) {
    return "youtube";
  } else {
    return undefined;
  }
}

function mapIcon(icon: Website) {
  switch (icon) {
    case "reddit":
      return "reddit-alien";
    case "wikipedia":
      return "wikipedia-w";
    case "youtube":
      return "youtube-play";
    default:
      return icon;
  }
}

function takePath(pathname: string, parts: number) {
  return Array.from(pathname.split("/")).slice(0, parts).join("/");
}
