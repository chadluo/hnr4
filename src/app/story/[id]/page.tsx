import Footer from "@/app/footer";
import { getHnStory } from "@/app/hn";
import * as React from "react";
import { SITE_TITLE } from "@/app/metadata";
import { Story, StoryPlaceholder } from "@/app/story";
import { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";

type Props = { params: { id: number } };

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = params;

  const { title } = await getHnStory(id);

  return { title: `${title} | ${SITE_TITLE}` };
}

/** Story page */
export default async function Page({ params }: Props) {
  const { id } = params;

  const hnUrl = `https://news.ycombinator.com/item?id=${id}`;
  const { title } = await getHnStory(id);

  return (
    <>
      <header className="mx-auto w-5/6 min-w-64 max-w-4xl pb-8 pt-12">
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
      <main className="mx-auto flex w-5/6 min-w-64 max-w-4xl flex-col gap-6">
        <React.Suspense fallback={<StoryPlaceholder />}>
          <Story storyId={id} full={true} />
        </React.Suspense>
      </main>
      <Footer />
    </>
  );
}
