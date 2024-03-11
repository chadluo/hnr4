import Footer from "@/app/footer";
import { getHnStory } from "@/app/hnStory";
import Story from "@/app/story";
import styles from "@/styles/index.module.css";
import storyPage from "@/styles/storyPage.module.css";
import { mono, sans } from "@/styles/typography";
import classNames from "classnames";
import Link from "next/link";
import Comment from "./comment";

type Props = { params: { id: number } };

export default async function Page({ params }: Props) {
  const { id } = params;
  const hnStory = await getHnStory(id);
  const { title, url, text, kids, type } = hnStory;

  if (!hnStory.url) return <></>;

  const hnUrl = `https://news.ycombinator.com/item?id=${id}`;

  return (
    <>
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
          storyId={id}
          title={title}
          url={url}
          text={text}
          kids={kids}
          type={type}
          longSummary={true}
        />
        {(text || kids) && (
          <div
            className={classNames(
              storyPage.discussions,
              mono.variable,
              sans.variable
            )}
          >
            {text && (
              <div
                className={storyPage.storyText}
                dangerouslySetInnerHTML={{ __html: text }}
              ></div>
            )}
            {kids?.map((kid) => (
              <Comment key={kid} commentId={kid} expand={false} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
