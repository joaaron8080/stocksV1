"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StockOverview } from "@/components/stock-overview";
import { FinancialTabs } from "@/components/financial-tabs";
import type { StockProfile } from "@/types/fmp";

interface StockPageProps {
  params: { ticker: string };
}

export default function StockPage({ params }: StockPageProps) {
  const ticker = params.ticker.toUpperCase();
  const [profile, setProfile] = useState<StockProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound">("loading");

  useEffect(() => {
    fetch(`/api/stock/${ticker}/profile`)
      .then((r) => r.json())
      .then((data: StockProfile[]) => {
        if (Array.isArray(data) && data[0]) {
          setProfile(data[0]);
          setStatus("ok");
        } else {
          setStatus("notfound");
        }
      })
      .catch(() => setStatus("notfound"));
  }, [ticker]);

  if (status === "loading") {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="mb-2 text-2xl font-bold">종목을 찾을 수 없습니다</h1>
        <p className="mb-6 text-sm text-muted-foreground">{ticker}</p>
        <Link
          href="/screener"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
        >
          스크리너로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <StockOverview profile={profile!} />
      <FinancialTabs ticker={ticker} />
    </div>
  );
}
