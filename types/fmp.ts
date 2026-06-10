export interface StockProfile {
  symbol: string;
  price: number;
  change: number;
  companyName: string;
  currency: string;
  exchange: string;
  industry: string;
  sector: string;
  description: string;
  ceo: string;
  fullTimeEmployees: string;
  image: string;
  ipoDate: string;
  mktCap: number;
  isEtf: boolean;
  isActivelyTrading: boolean;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changePercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
}
