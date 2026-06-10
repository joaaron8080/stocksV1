"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ScreenerResult, ScreenerFilters } from "@/types/screener";

interface Snapshot {
  id: number;
  name: string;
  searchedAt: string;
  resultCount: number;
  filters: string;
}

interface SnapshotDetail extends Omit<Snapshot, "filters"> {
  filters: ScreenerFilters;
  results: ScreenerResult[];
}

function fmt(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function filterSummary(filtersJson: string): string {
  try {
    const f: ScreenerFilters = JSON.parse(filtersJson);
    const parts: string[] = [];
    if (f.exchange) parts.push(f.exchange);
    if (f.sector) parts.push(f.sector);
    if (f.marketCapMin) parts.push(`시총≥${fmt(Number(f.marketCapMin))}`);
    if (f.marketCapMax) parts.push(`시총≤${fmt(Number(f.marketCapMax))}`);
    if (f.priceMin) parts.push(`주가≥$${f.priceMin}`);
    if (f.priceMax) parts.push(`주가≤$${f.priceMax}`);
    return parts.length ? parts.join(", ") : "필터 없음";
  } catch {
    return "—";
  }
}

export default function SavedScreenerPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SnapshotDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function loadList() {
    setLoading(true);
    try {
      const res = await fetch("/api/screener/saved");
      const data = await res.json();
      setSnapshots(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadList(); }, []);

  async function openDetail(id: number) {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/screener/saved/${id}`);
      const data = await res.json();
      setSelected(data);
    } finally {
      setDetailLoading(false);
    }
  }

  async function deleteSnapshot(id: number) {
    await fetch(`/api/screener/saved/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/screener" className="text-xs text-muted-foreground hover:text-foreground">
          ← 스크리너로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold">저장된 검색 결과</h1>
      </div>

      {loading && <p className="py-12 text-center text-sm text-muted-foreground">로딩 중...</p>}

      {!loading && snapshots.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">저장된 검색 결과가 없습니다.</p>
      )}

      {!loading && snapshots.length > 0 && !selected && (
        <div className="space-y-2">
          {snapshots.map((s) => (
            <Card key={s.id} className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => openDetail(s.id)}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.searchedAt).toLocaleString("ko-KR")} · {s.resultCount}개 종목 · {filterSummary(s.filters)}
                  </p>
                </div>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); deleteSnapshot(s.id); }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  삭제
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {detailLoading && <p className="py-12 text-center text-sm text-muted-foreground">로딩 중...</p>}

      {selected && !detailLoading && (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={() => setSelected(null)}>
              ← 목록으로
            </Button>
            <div>
              <h2 className="font-semibold">{selected.name}</h2>
              <p className="text-xs text-muted-foreground">
                {new Date(selected.searchedAt).toLocaleString("ko-KR")} · {selected.resultCount}개 종목
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto text-muted-foreground hover:text-destructive"
              onClick={() => deleteSnapshot(selected.id)}
            >
              삭제
            </Button>
          </div>

          <Card>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">티커</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">회사명</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">섹터</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">시가총액</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">주가</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.results.map((r) => (
                    <tr key={r.symbol} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">
                        <Link href={`/stock/${r.symbol}`} className="hover:text-primary hover:underline">
                          {r.symbol}
                        </Link>
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-2 text-muted-foreground">{r.companyName}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="text-xs">{r.sector || "—"}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.marketCap ? fmt(r.marketCap) : "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">${r.price?.toFixed(2) ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
