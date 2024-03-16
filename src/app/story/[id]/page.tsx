import Footer from "@/app/footer";
import { getHnStory } from "@/app/hnStory";
import Story from "@/app/story";
import page from "@/styles/page.module.css";
import storyPage from "@/styles/storyPage.module.css";
import { sans } from "@/styles/typography";
import classNames from "classnames";
import Link from "next/link";

type Props = { params: { id: number } };

/** Story page */
export default async function Page({ params }: Props) {
  const { id } = params;

  const hnUrl = `https://news.ycombinator.com/item?id=${id}`;
  const { title } = await getHnStory(id);

  return (
    <>
      <header className={classNames(page.header)}>
        <h1 className={storyPage.title}>
          <Link href="/" className={storyPage.back}>
            🡨
          </Link>
          <Link
            href={hnUrl}
            className={classNames(storyPage.hnTitle, sans.className)}
            target="_blank"
          >
            {title}
          </Link>
        </h1>
      </header>
      <main className={classNames(page.main, sans.className)}>
        <Story storyId={id} full={true} />
      </main>
      <Footer />
    </>
  );
}
