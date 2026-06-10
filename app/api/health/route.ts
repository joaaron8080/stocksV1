import { NextResponse } from "next/server";

export async function GET() {
  try {
    const key = process.env.FMP_API_KEY ?? "missing";
    const url = `https://financialmodelingprep.com/stable/quote?symbol=AAPL&apikey=${key}`;
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    return NextResponse.json({
      ok: true,
      fmpStatus: res.status,
      fmpPreview: text.substring(0, 100),
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
