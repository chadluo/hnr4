import Footer from "@/app/footer";
import { getHnStory } from "@/app/hn";
import Story from "@/app/story";
import Link from "next/link";

type Props = { params: { id: number } };

/** Story page */
export default async function Page({ params }: Props) {
  const { id } = params;

  const hnUrl = `https://news.ycombinator.com/item?id=${id}`;
  const { title } = await getHnStory(id);

  return (
    <>
      <header className="mx-auto w-5/6 min-w-64 max-w-6xl pb-8 pt-12">
        <h1 className="text-base">
          <Link
            href="/"
            className="-ml-3 mr-3 px-3 py-2 font-normal hover:bg-neutral-900/70"
          >
            🡨
          </Link>
          <Link
            href={hnUrl}
            className="text-base font-bold hover:text-[#f60]"
            target="_blank"
          >
            {title}
          </Link>
        </h1>
      </header>
      <main className="mx-auto flex w-5/6 min-w-64 max-w-6xl flex-col gap-6">
        <Story storyId={id} full={true} />
      </main>
      <Footer />
    </>
  );
}
