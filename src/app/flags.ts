import { flag } from "@vercel/flags/next";

export type Flags = {
  forceRefreshSummary?: boolean;
  fakeSummary?: boolean;
};

export const fakeSummary = flag({
  key: "fakeSummary",
  decide: () => process.env.NODE_ENV !== "production",
});

export const forceRefreshSummary = flag({
  key: "forceRefreshSummary",
  decide: () => process.env.NODE_ENV !== "production",
});
