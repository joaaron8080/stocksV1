import { notFound } from "next/navigation";
import { getProfile } from "@/lib/fmp";
import { StockOverview } from "@/components/stock-overview";
import { FinancialTabs } from "@/components/financial-tabs";
import type { StockProfile } from "@/types/fmp";

interface StockPageProps {
  params: { ticker: string };
}

export default async function StockPage({ params }: StockPageProps) {
  const ticker = params.ticker.toUpperCase();

  let profile: StockProfile | null = null;
  try {
    const data = (await getProfile(ticker)) as StockProfile[];
    profile = Array.isArray(data) && data[0] ? data[0] : null;
  } catch {
    notFound();
  }

  if (!profile) notFound();

  return (
    <div>
      <StockOverview profile={profile} />
      <FinancialTabs ticker={ticker} />
    </div>
  );
}
