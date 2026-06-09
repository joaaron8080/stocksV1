"use client";

import { useCallback, useEffect, useState } from "react";
import { loadWatchlist, saveWatchlist, type WatchlistItem } from "@/lib/watchlist";

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    setItems(loadWatchlist());
  }, []);

  const add = useCallback((ticker: string, companyName: string) => {
    setItems((prev) => {
      if (prev.some((i) => i.ticker === ticker)) return prev;
      const next = [...prev, { ticker, companyName, addedAt: new Date().toISOString() }];
      saveWatchlist(next);
      return next;
    });
  }, []);

  const remove = useCallback((ticker: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.ticker !== ticker);
      saveWatchlist(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    saveWatchlist([]);
    setItems([]);
  }, []);

  const has = useCallback(
    (ticker: string) => items.some((i) => i.ticker === ticker),
    [items]
  );

  return { items, add, remove, clear, has };
}
