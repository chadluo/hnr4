import kv from "@vercel/kv";
import { NextResponse } from "next/server";

export const config = { runtime: "edge" };

export default async function hander(request, context) {
  const searchParams = new URL(request.url).searchParams;
  const url = searchParams.get("url");
  try {
    new URL(url);
  } catch (err) {
    return NextResponse.error();
  }

  const storyId = searchParams.get("storyId");
  const key = `summary-${storyId}`;
  const existingSummary = await kv.get(key);
  if (existingSummary) {
    return existingSummary;
  }

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: `Visit and generate 2 summarizations of ${url},
        the first of one sentence, the other being a proper summarization, separated by a forward slash:`,
      max_tokens: 256,
      top_p: 0.5,
      frequency_penalty: 1,
    }),
  });
  const json = await response.json();
  const summary = {
    text: json.choices.map((choice) => choice.text).join(""),
  };
  context.waitUntil(kv.set(key, summary));

  return NextResponse.json(summary, { headers: { "Cache-Control": "max-age=0, s-maxage=21600" } });
}
