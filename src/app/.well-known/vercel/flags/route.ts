import { verifyAccess, type ApiData } from "flags";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const access = await verifyAccess(request.headers.get("Authorization"));
  if (!access) return NextResponse.json(null, { status: 401 });

  return NextResponse.json<ApiData>({
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
  });
}
