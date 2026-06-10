import { NextRequest, NextResponse } from "next/server";
import { getScreener } from "@/lib/fmp";
import { prisma } from "@/lib/prisma";

const CACHE_NAME = "__cache__";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const filtersKey = JSON.stringify(params);

  try {
    const data = await getScreener(params);
    const results = Array.isArray(data) ? data : [];

    if (results.length > 0) {
      await prisma.screenerSnapshot.deleteMany({
        where: { name: CACHE_NAME, filters: filtersKey },
      });
      await prisma.screenerSnapshot.create({
        data: {
          name: CACHE_NAME,
          filters: filtersKey,
          results: JSON.stringify(results),
          resultCount: results.length,
        },
      });
    }

    return NextResponse.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";

    if (message.includes("402") || message.includes("403")) {
      const cached = await prisma.screenerSnapshot.findFirst({
        where: { filters: filtersKey },
        orderBy: { searchedAt: "desc" },
      });

      if (cached) {
        return NextResponse.json(JSON.parse(cached.results), {
          headers: {
            "X-Cache": "HIT",
            "X-Cache-Date": cached.searchedAt.toISOString(),
            "X-Cache-Name": cached.name,
          },
        });
      }

      return NextResponse.json(
        { error: "FMP screener requires a paid plan. No cached results." },
        { status: 402 }
      );
    }

    const status = message.includes("FMP_API_KEY") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
