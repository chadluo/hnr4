import { ApiData, verifyAccess } from "flags";
import { createFlagsDiscoveryEndpoint } from "flags/next";

export const GET = createFlagsDiscoveryEndpoint(async (request) => {
  const access = await verifyAccess(request.headers.get("Authorization"));
  if (!access) return {};

  return {
    definitions: {
      fakeSummary: {
        options: [
          { value: false, label: "false" },
          { value: true, label: "true" },
        ],
      },
      forceRefreshSummary: {
        options: [
          { value: false, label: "false" },
          { value: true, label: "true" },
        ],
      },
    },
  } as ApiData;
});
