import Footer from "@/app/footer";
import { getHnStory } from "@/app/hnStory";
import Story from "@/app/story";
import styles from "@/styles/index.module.css";
import storyPage from "@/styles/storyPage.module.css";
import classNames from "classnames";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import Comment from "./comment";

type Props = { params: { id: number } };

const mono = IBM_Plex_Mono({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
});
const sans = IBM_Plex_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export default async function Page({ params }: Props) {
  const hnStory = await getHnStory(params.id);
  const { id, title, url, text, kids, type } = hnStory;

  if (!hnStory.url) return <></>;

  const hnUrl = `https://news.ycombinator.com/item?id=${params.id}`;

  return (
    <>
      {/*  <style jsx global>{`
        code {
          font-family: ${mono.style.fontFamily};
          font-size: calc(1rem - 2px);
        }
      `}</style> */}
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
        <Story
          storyId={params.id}
          title={title}
          url={url}
          text={text}
          kids={kids}
          type={type}
          longSummary={true}
        />
        {(text || kids) && (
          <div className={storyPage.discussions}>
            {text && (
              <div
                className={storyPage.storyText}
                dangerouslySetInnerHTML={{ __html: text }}
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
