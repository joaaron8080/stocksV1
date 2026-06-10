const FMP_BASE = "https://financialmodelingprep.com/stable";
const CACHE_TTL = 86400;

function getApiKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error("FMP_API_KEY is not set");
  return key;
}

interface FmpResponse {
  value?: unknown[];
}

async function fetchFmp(
  path: string,
  options?: RequestInit
): Promise<unknown[]> {
  const key = getApiKey();
  const url = `${FMP_BASE}${path}${path.includes("?") ? "&" : "?"}apikey=${key}`;
  const res = await fetch(url, options);
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

const CACHED: RequestInit = { next: { revalidate: CACHE_TTL } } as RequestInit;
const NO_CACHE: RequestInit = { cache: "no-store" };

export async function getScreener(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return fetchFmp(`/company-screener${qs ? `?${qs}` : ""}`, NO_CACHE);
}

export async function getProfile(ticker: string) {
  return fetchFmp(`/profile?symbol=${ticker}`, CACHED);
}

export async function getQuote(ticker: string) {
  return fetchFmp(`/quote?symbol=${ticker}`, NO_CACHE);
}

export async function getIncomeStatement(ticker: string) {
  return fetchFmp(`/income-statement?symbol=${ticker}&limit=5`, CACHED);
}

export async function getBalanceSheet(ticker: string) {
  return fetchFmp(`/balance-sheet-statement?symbol=${ticker}&limit=5`, CACHED);
}

export async function getCashFlow(ticker: string) {
  return fetchFmp(`/cash-flow-statement?symbol=${ticker}&limit=5`, CACHED);
}

export async function getRatios(ticker: string) {
  return fetchFmp(`/ratios?symbol=${ticker}&limit=5`, CACHED);
}
