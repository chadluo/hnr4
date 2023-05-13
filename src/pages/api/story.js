import { NextResponse } from "next/server";

export const config = { runtime: "edge" };

export default async function handler(request) {
  const storyId = new URL(request.url).searchParams.get("storyId");
  if (!storyId || !isFinite(storyId)) {
    return NextResponse.error();
  }

  return NextResponse.json(await (await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`)).json(), {
    headers: { "Cache-Control": "max-age=0, s-maxage=60" },
  });
}
