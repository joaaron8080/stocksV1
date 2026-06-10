import { NextResponse } from "next/server";

export async function GET() {
  try {
    const key = process.env.FMP_API_KEY ?? "missing";
    const keyInfo = {
      len: key.length,
      first4: key.slice(0, 4),
      last4: key.slice(-4),
      hasCarriageReturn: key.includes("\r"),
      charCodes: Array.from(key.slice(-3)).map((c) => c.charCodeAt(0)),
    };
    const url = `https://financialmodelingprep.com/stable/quote?symbol=AAPL&apikey=${key}`;
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    return NextResponse.json({
      ok: true,
      fmpStatus: res.status,
      fmpPreview: text.substring(0, 200),
      keyInfo,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
