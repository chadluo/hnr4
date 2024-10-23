import { type FlagOverridesType, decrypt } from "@vercel/flags";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

async function getFlags(request: NextRequest) {
  const overrideCookie = cookies().get("vercel-flag-overrides")?.value;
  const overrides = overrideCookie
    ? await decrypt<FlagOverridesType>(overrideCookie)
    : {};

  const flags = {
    fakeSummary: overrides?.fakeSummary ?? false,
    forceRefreshSummary: overrides?.forceRefreshSummary ?? false,
  };

  return flags;
}
