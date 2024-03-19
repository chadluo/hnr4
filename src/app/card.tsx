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

export type Website =
  | "apple"
  | "github"
  | "reddit"
  | "wikipedia"
  | "youtube"
  | "ycombinator";

export default function Card(props: CardProps) {
  const { title, url, image, authors, description } = props;
  const imageUrl = checkImageUrl(image);

  const source = authors ? authors : url && extractSource(url);
  const website = findWebsite(url);
  const icon = website ? (
    <>
      <i className={classNames("fa", `fa-${mapIcon(website)}`)}></i>{" "}
    </>
  ) : undefined;

  return (
    <Link
      href={url}
      title={url}
      className={classNames(
        { [styles.imageCard]: imageUrl },
        "flex",
        "flex-col-reverse",
        "lg:flex-row",
        "bg-neutral-900/70",
        "border-neutral-700",
        "hover:border-neutral-500",
      )}
      target="_blank"
    >
      <div className={styles.textBox}>
        <span className={classNames('line-clamp-2','text-neutral-500')} title={url}>
          {icon}
          {source}
        </span>
        <h2
          className={classNames("text-base", "font-bold")}
          dangerouslySetInnerHTML={{ __html: title.replaceAll("/", "<wbr>/") }}
        ></h2>
        <div className="line-clamp-3" title={description}>
          {description}
        </div>
      </div>
      {imageUrl && (
        <div
          className={styles.imageBox}
          style={{ backgroundImage: `url(${imageUrl})` }}
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

function takePath(pathname: string, parts: number) {
  return Array.from(pathname.split("/"))
    .slice(0, parts)
    .filter((s) => s !== "")
    .join("/");
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
  } else if (hostname.endsWith("ycombinator.com")) {
    return "ycombinator";
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
    case "ycombinator":
      return "y-combinator";
    default:
      return icon;
  }
}

function checkImageUrl(image?: string) {
  if (image) {
    try {
      new URL(image);
      return image;
    } catch (e) {}
  }
}
