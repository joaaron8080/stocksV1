"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWatchlist } from "@/hooks/use-watchlist";
import type { StockQuote } from "@/types/fmp";

interface QuoteMap {
  [ticker: string]: StockQuote;
}

function SP500Banner() {
  const [quote, setQuote] = useState<StockQuote | null>(null);

  useEffect(() => {
    fetch("/api/stock/%5EGSPC/quote")
      .then((r) => r.json())
      .then((d: StockQuote[]) => {
        if (Array.isArray(d) && d[0]) setQuote(d[0]);
      })
      .catch(() => {});
  }, []);

  if (!quote) {
    return <div className="mb-8 h-16 animate-pulse rounded-xl bg-muted" />;
  }

  const isPositive = quote.changesPercentage >= 0;

  return (
    <Card className="mb-8">
      <CardContent className="flex items-center justify-between py-4">
        <div>
          <p className="text-xs text-muted-foreground">S&P 500</p>
          <p className="text-2xl font-bold tabular-nums">
            {quote.price.toFixed(2)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={isPositive ? "default" : "destructive"} className="text-sm">
            {isPositive ? "+" : ""}
            {quote.changesPercentage.toFixed(2)}%
          </Badge>
          <span className="text-xs text-muted-foreground tabular-nums">
            {isPositive ? "+" : ""}
            {quote.change?.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function WatchlistGrid({ tickers }: { tickers: { ticker: string; companyName: string }[] }) {
  const [quotes, setQuotes] = useState<QuoteMap>({});

  useEffect(() => {
    tickers.forEach(({ ticker }) => {
      fetch(`/api/stock/${ticker}/quote`)
        .then((r) => r.json())
        .then((d: StockQuote[]) => {
          if (Array.isArray(d) && d[0]) {
            setQuotes((prev) => ({ ...prev, [ticker]: d[0] }));
          }
        })
        .catch(() => {});
    });
  }, [tickers]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tickers.map(({ ticker, companyName }) => {
        const q = quotes[ticker];
        const isPositive = q && q.changesPercentage >= 0;
        return (
          <Link key={ticker} href={`/stock/${ticker}`}>
            <Card className="h-full hover:ring-primary/40 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">{ticker}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-1">{companyName}</p>
              </CardHeader>
              <CardContent>
                {q ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold tabular-nums">
                      ${q.price.toFixed(2)}
                    </span>
                    <Badge variant={isPositive ? "default" : "destructive"}>
                      {isPositive ? "+" : ""}
                      {q.changesPercentage.toFixed(2)}%
                    </Badge>
                  </div>
                ) : (
                  <div className="h-7 animate-pulse rounded bg-muted" />
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const { items } = useWatchlist();

  return (
    <div>
      <SP500Banner />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">관심종목</h2>
        {items.length > 0 && (
          <Link
            href="/watchlist"
            className="text-sm text-primary hover:underline"
          >
            전체 보기
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="mb-2 text-lg font-medium">관심종목이 없습니다</p>
          <p className="mb-6 text-sm text-muted-foreground">
            스크리너에서 종목을 검색하고 추가해보세요
          </p>
          <Link
            href="/screener"
            className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
          >
            스크리너 바로가기
          </Link>
        </div>
      ) : (
        <WatchlistGrid
          tickers={items.map((i) => ({ ticker: i.ticker, companyName: i.companyName }))}
        />
      )}
    </div>
  );
}
