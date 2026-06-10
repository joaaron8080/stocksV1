import { unstable_cache } from "next/cache";

const FMP_BASE = "https://financialmodelingprep.com/stable";
const CACHE_TTL = 86400; // 24h

function getApiKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error("FMP_API_KEY is not set");
  return key;
}

interface FmpResponse {
  value?: unknown[];
}

async function fetchFmp(path: string): Promise<unknown[]> {
  const key = getApiKey();
  const url = `${FMP_BASE}${path}${path.includes("?") ? "&" : "?"}apikey=${key}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FMP ${path} → ${res.status} ${res.statusText}`);
  }
  const json: unknown = await res.json();
  if (Array.isArray(json)) return json;
  if (json && typeof json === "object" && Array.isArray((json as FmpResponse).value)) {
    return (json as FmpResponse).value!;
  }
  return [];
}

export async function getScreener(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return fetchFmp(`/company-screener${qs ? `?${qs}` : ""}`);
}

const cachedFetch = (path: string) =>
  unstable_cache(() => fetchFmp(path), [path], { revalidate: CACHE_TTL })();

export async function getProfile(ticker: string) {
  return cachedFetch(`/profile?symbol=${ticker}`);
}

export async function getQuote(ticker: string) {
  return fetchFmp(`/quote?symbol=${ticker}`);
}

export async function getIncomeStatement(ticker: string) {
  return cachedFetch(`/income-statement?symbol=${ticker}&limit=5`);
}

export async function getBalanceSheet(ticker: string) {
  return cachedFetch(`/balance-sheet-statement?symbol=${ticker}&limit=5`);
}

export async function getCashFlow(ticker: string) {
  return cachedFetch(`/cash-flow-statement?symbol=${ticker}&limit=5`);
}

export async function getRatios(ticker: string) {
  return cachedFetch(`/ratios?symbol=${ticker}&limit=5`);
}
