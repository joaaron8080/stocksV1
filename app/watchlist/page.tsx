"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WatchlistCard } from "@/components/watchlist-card";
import { useWatchlist } from "@/hooks/use-watchlist";

export default function WatchlistPage() {
  const { items, remove, clear } = useWatchlist();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">관심종목</h1>
        {items.length > 0 && (
          <Button variant="destructive" size="sm" onClick={clear}>
            전체 삭제
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <WatchlistCard key={item.ticker} item={item} onRemove={remove} />
          ))}
        </div>
      )}
    </div>
  );
}
