import { unstable_cache } from "next/cache";

const FMP_BASE = "https://financialmodelingprep.com/api/v3";
const CACHE_TTL = 86400; // 24h

function getApiKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error("FMP_API_KEY is not set");
  return key;
}

async function fetchFmp(path: string): Promise<unknown> {
  const key = getApiKey();
  const url = `${FMP_BASE}${path}${path.includes("?") ? "&" : "?"}apikey=${key}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FMP ${path} → ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getScreener(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return fetchFmp(`/stock-screener${qs ? `?${qs}` : ""}`);
}

const cachedFetch = (path: string) =>
  unstable_cache(() => fetchFmp(path), [path], { revalidate: CACHE_TTL })();

export async function getProfile(ticker: string) {
  return cachedFetch(`/profile/${ticker}`);
}

export async function getQuote(ticker: string) {
  return fetchFmp(`/quote/${ticker}`);
}

export async function getIncomeStatement(ticker: string) {
  return cachedFetch(`/income-statement/${ticker}?limit=5`);
}

export async function getBalanceSheet(ticker: string) {
  return cachedFetch(`/balance-sheet-statement/${ticker}?limit=5`);
}

export async function getCashFlow(ticker: string) {
  return cachedFetch(`/cash-flow-statement/${ticker}?limit=5`);
}

export async function getRatios(ticker: string) {
  return cachedFetch(`/ratios/${ticker}?limit=5`);
}
