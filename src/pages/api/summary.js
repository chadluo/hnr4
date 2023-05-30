import kv from "@vercel/kv";
import { NextResponse } from "next/server";

export const config = { runtime: "edge" };

const responseOption = { headers: { "Cache-Control": "max-age=0, s-maxage=21600" } };

export default async function hander(request, context) {
  const searchParams = new URL(request.url).searchParams;
  const url = searchParams.get("url");
  try {
    new URL(url);
  } catch (err) {
    return NextResponse.json({ error: `Invalid url [${url}]` }, { status: 400 });
  }

  if (process.env.mode === "dev") {
    return NextResponse.json({ text: "fake summary | long fake summary" });
  }

  const storyId = searchParams.get("storyId");
  const key = `summary-${storyId}`;
  const existingSummary = await kv.get(key);
  if (existingSummary) {
    return NextResponse.json(existingSummary, responseOption);
  }

  let response;
  try {
    response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: `Visit and generate 2 summarizations of ${url},
        the first of one sentence, the other being a proper summarization, separated by a vertical bar:`,
        max_tokens: 256,
        top_p: 0.5,
        frequency_penalty: 1,
      }),
    });
  } catch (error) {
    const errorMessage = `Failed requesting summaries for [${url}]`;
    console.error(errorMessage, error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  if (!response.ok) {
    const errorMessage = `Failed requesting summaries for [${url}]`;
    console.error(errorMessage, response);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  const json = await response.json();
  if (!json.choices) {
    const errorMessage = `Missing mandatory field 'choices': ${json}`;
    console.error(errorMessage, response);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  const summary = {
    text: json.choices.map((choice) => choice.text).join(""),
  };
  context.waitUntil(kv.set(key, summary));

  return NextResponse.json(summary, responseOption);
}
