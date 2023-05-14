import { NextResponse } from "next/server";

export const config = { runtime: "edge" };

export default async function hander(request) {
  const url = new URL(request.url).searchParams.get("url");
  try {
    const { hostname } = new URL(url);
    if (hostname !== "twitter.com") {
      return NextResponse.error();
    }
  } catch (err) {
    return NextResponse.error();
  }

  return NextResponse.json(
    await (
      await fetch(`https://publish.twitter.com/oembed?hide_thread=1&theme=dark&dnt=true&omit_script=1&url=${url}`)
    ).json()
  );
}
