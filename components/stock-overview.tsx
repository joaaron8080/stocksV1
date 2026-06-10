"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/use-watchlist";
import type { StockProfile, StockQuote } from "@/types/fmp";

interface StockOverviewProps {
  profile: StockProfile;
}

export function StockOverview({ profile }: StockOverviewProps) {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const { add, remove, has } = useWatchlist();

  const inWatchlist = has(profile.symbol);

  useEffect(() => {
    fetch(`/api/stock/${profile.symbol}/quote`)
      .then((r) => r.json())
      .then((data: StockQuote[]) => {
        if (Array.isArray(data) && data[0]) setQuote(data[0]);
      })
      .catch(() => {});
  }, [profile.symbol]);

  const price = quote?.price ?? profile.price;
  const changesPct = quote?.changePercentage ?? null;
  const isPositive = changesPct !== null && changesPct >= 0;

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold">{profile.symbol}</h1>
            {profile.exchange && (
              <Badge variant="outline">{profile.exchange}</Badge>
            )}
            {profile.sector && (
              <Badge variant="secondary">{profile.sector}</Badge>
            )}
          </div>
          <p className="mt-1 text-lg text-muted-foreground">{profile.companyName}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold tabular-nums">
              ${price.toFixed(2)}
            </span>
            {changesPct !== null && (
              <Badge variant={isPositive ? "default" : "destructive"} className="text-sm">
                {isPositive ? "+" : ""}
                {changesPct.toFixed(2)}%
              </Badge>
            )}
          </div>
          <Button
            variant={inWatchlist ? "secondary" : "outline"}
            size="sm"
            onClick={() =>
              inWatchlist
                ? remove(profile.symbol)
                : add(profile.symbol, profile.companyName)
            }
          >
            {inWatchlist ? "★ 관심종목 해제" : "☆ 관심종목 추가"}
          </Button>
        </div>
      </div>

      {profile.description && (
        <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
          {profile.description}
        </p>
      )}
    </div>
  );
}
