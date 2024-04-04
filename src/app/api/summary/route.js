import kv from "@vercel/kv";
import { NextResponse } from "next/server";

export const runtime = "edge";

const responseOption = {
  headers: { "Cache-Control": "max-age=0, s-maxage=21600" },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  try {
    new URL(url);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid url [${url}]` },
      { status: 400 },
    );
  }

  if (process.env.mode === "dev") {
    return NextResponse.json({ short: "short summary", long: "long summary" });
  }

  const storyId = searchParams.get("storyId");
  const key = `summary-${storyId}`;
  const existingSummary = await kv.get(key);
  if (existingSummary) {
    return NextResponse.json(existingSummary, responseOption);
  }

  let response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an assistant good at extracting core information out of texts. You should only generate valid JSON and no normal texts.`,
          },
          {
            role: "user",
            content: `Visit and generate 2 summarizations of ${url}, the first of one short sentence, the other
             being a long proper summarization. Return them in a JSON object of keys 'short' and 'long'.`,
          },
        ],
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

  let summary;
  try {
    summary = JSON.parse(json.choices[0].message.content);
  } catch (error) {
    console.error(
      "Failed parsing response",
      error,
      json.choices[0].message.content,
    );
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
  context.waitUntil(kv.set(key, summary));

  return NextResponse.json(summary, responseOption);
}
