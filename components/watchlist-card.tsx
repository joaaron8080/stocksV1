"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WatchlistItem } from "@/lib/watchlist";

interface QuoteData {
  price: number;
  changePercentage: number;
}

interface WatchlistCardProps {
  item: WatchlistItem;
  onRemove: (ticker: string) => void;
}

export function WatchlistCard({ item, onRemove }: WatchlistCardProps) {
  const [quote, setQuote] = useState<QuoteData | null>(null);

  useEffect(() => {
    fetch(`/api/stock/${item.ticker}/quote`)
      .then((r) => r.json())
      .then((data: QuoteData[]) => {
        if (Array.isArray(data) && data[0]) setQuote(data[0]);
      })
      .catch(() => {});
  }, [item.ticker]);

  const isPositive = quote && quote.changePercentage >= 0;

  return (
    <Card className="hover:ring-primary/40 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Link href={`/stock/${item.ticker}`} className="flex-1">
            <CardTitle className="text-lg hover:text-primary transition-colors">
              {item.ticker}
            </CardTitle>
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
              {item.companyName}
            </p>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove(item.ticker)}
            aria-label={`${item.ticker} 삭제`}
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {quote ? (
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold">
              ${quote.price.toFixed(2)}
            </span>
            <Badge variant={isPositive ? "default" : "destructive"}>
              {isPositive ? "+" : ""}
              {quote.changePercentage.toFixed(2)}%
            </Badge>
          </div>
        ) : (
          <div className="h-7 animate-pulse rounded bg-muted" />
        )}
      </CardContent>
    </Card>
  );
}
