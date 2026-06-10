export interface ScreenerResult {
  symbol: string;
  companyName: string;
  marketCap: number;
  sector: string;
  industry: string;
  beta: number;
  price: number;
  lastAnnualDividend: number;
  volume: number;
  exchange: string;
  country: string;
  isEtf: boolean;
  isActivelyTrading: boolean;
}

export interface ScreenerFilters {
  exchange: string;
  sector: string;
  marketCapMin: string;
  marketCapMax: string;
  priceMin: string;
  priceMax: string;
}

export type SortKey = keyof Pick<
  ScreenerResult,
  "symbol" | "companyName" | "sector" | "marketCap" | "price"
>;

export type SortDir = "asc" | "desc";
