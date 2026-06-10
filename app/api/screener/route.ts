import { NextRequest, NextResponse } from "next/server";
import { getScreener } from "@/lib/fmp";

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const data = await getScreener(params);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    if (message.includes("402")) {
      return NextResponse.json(
        { error: "FMP screener requires a paid plan (free tier returns 402)" },
        { status: 402 }
      );
    }
    const status = message.includes("FMP_API_KEY") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
