import { kv } from "@vercel/kv";

export type Summary = { short: string; long: string };

export async function getSummary(
  storyId: number,
  url: string,
): Promise<Summary | null> {
  try {
    new URL(url);
  } catch (err) {
    console.error(`Invalid url [${url}]`);
    return null;
  }

  if (process.env.mode === "dev") {
    return { short: "short summary", long: "long summary" };
  }

  const key = `summary-${storyId}`;
  const existingSummary = await kv.get(key);
  if (existingSummary) {
    return existingSummary as Summary;
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
    return null;
  }

  if (!response.ok) {
    const errorMessage = `Failed requesting summaries for [${url}]`;
    console.error(errorMessage, response);
    return null;
  }

  const json = await response.json();
  if (!json.choices) {
    const errorMessage = `Missing mandatory field 'choices': ${json}`;
    console.error(errorMessage, response);
    return null;
  }

  let summary;
  try {
    summary = JSON.parse(json.choices[0].message.content);
  } catch (error) {
    const errorMessage = `Failed parsing response ${error} ${json.choices[0].message.content}`;
    console.error(errorMessage);
    return null;
  }
  kv.set(key, summary);

  return summary;
}
