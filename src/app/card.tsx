import Link from "next/link";
import Image from "next/image";
import { getHtmlContent } from "./contents";
import { getMeta } from "./meta";

type CardProps = {
  storyId: number;
  url: string | undefined;
  hnTitle: string;
  hnUrl: string;
  hnText: string | undefined;
};

export type Meta = {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  authors?: string;
};

type Website =
  | "apple"
  | "github"
  | "medium"
  | "reddit"
  | "wikipedia"
  | "ycombinator"
  | "youtube";

export async function Card(props: CardProps) {
  const { storyId, url, hnTitle, hnUrl, hnText } = props;

  if (url != null) {
    const html = await getHtmlContent(url);
    if (html != null) {
      const meta = await getMeta(storyId, html);
      if (meta != null) {
        const title = meta.title ?? hnTitle;
        const description = meta.description;
        const image = meta.image;
        const imageAlt = meta.imageAlt;
        const authors = meta.authors;

        const imageUrl = checkImageUrl(image);
        const dataSource = authors ? authors : url && extractSource(url);
        const website = findWebsite(url);
        const icon = website ? (
          <i className={`fa fa-${mapIcon(website)} mr-1`}></i>
        ) : undefined;

        return innerCard({
          url,
          title,
          source: dataSource,
          icon,
          description,
          imageUrl,
          imageAlt,
        });
      }
    }
  }

  return innerCard({
    url: hnUrl,
    source: extractSource(hnUrl),
    title: hnTitle,
    description: hnText ?? "",
    icon: undefined,
  });
}

function innerCard({
  url,
  icon,
  source,
  title,
  description,
  imageUrl,
  imageAlt,
}: {
  url: string;
  source: string;
  title: string;
  description: string;
  icon: JSX.Element | undefined;
  imageUrl?: string;
  imageAlt?: string;
}) {
  return (
    <Link
      href={url}
      title={url}
      className="flex flex-col border border-neutral-700 bg-neutral-900/70 hover:border-neutral-500 md:flex-row-reverse"
      target="_blank"
    >
      {imageUrl && (
        <div className="peer basis-1/3">
          <Image
            src={imageUrl}
            alt={imageAlt ?? ""}
            fill={false}
            width={320}
            height={160}
            className="aspect-2/1 w-full object-cover md:w-80"
          />
        </div>
      )}
      <div className="basis-full px-3 py-2 peer-[]:basis-2/3">
        <span className="line-clamp-2 text-neutral-500" title={url}>
          {icon}
          {source}
        </span>
        <h2
          className="text-base font-bold"
          dangerouslySetInnerHTML={{
            __html: title.replaceAll("/", "<wbr>/"),
          }}
        ></h2>
        <div
          className="line-clamp-3 break-words"
          // override for http://localhost:4000/story/39792136
          style={{ overflowWrap: "anywhere" }}
          title={description}
        >
          {description}
        </div>
      </div>
    </Link>
  );
}

function extractSource(url: string) {
  const { hostname, pathname } = new URL(url);
  if (hostname === "github.com" || hostname.includes("reddit.com")) {
    return takePath(pathname, 3);
  } else if (hostname === "medium.com") {
    return takePath(pathname, 2);
  } else if (hostname === "gist.github.com") {
    return `${hostname}/${takePath(pathname, 2)}`;
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
  } else if (hostname.endsWith("medium.com")) {
    return "medium";
  } else if (hostname.endsWith("reddit.com")) {
    return "reddit";
  } else if (hostname.endsWith("wikipedia.org")) {
    return "wikipedia";
  } else if (hostname.endsWith("ycombinator.com")) {
    return "ycombinator";
  } else if (hostname.endsWith("youtube.com")) {
    return "youtube";
  } else {
    return undefined;
  }
}

function mapIcon(website: Website) {
  switch (website) {
    case "reddit":
      return "reddit-alien";
    case "wikipedia":
      return "wikipedia-w";
    case "youtube":
      return "youtube-play";
    case "ycombinator":
      return "y-combinator";
    default:
      return website;
  }
}

function checkImageUrl(image?: string) {
  if (image && URL.canParse(image)) {
    return image;
  }
}
