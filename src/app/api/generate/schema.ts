import { z } from "zod";

export const messageSchema = z.object({
  summary: z.string(),
});
