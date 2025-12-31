import { z } from "zod";

export const openRouterConfig = {
    model: "openrouter/auto",
    apiKey: process.env.OPENROUTER_API_KEY,
    schema: z.object({
        summary: z.string(),
        model: z.string(),
    }),
};
