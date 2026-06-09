import { NextRequest, NextResponse } from "next/server";
import { getIncomeStatement } from "@/lib/fmp";

export async function GET(
  _req: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const data = await getIncomeStatement(params.ticker.toUpperCase());
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = message.includes("FMP_API_KEY") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
