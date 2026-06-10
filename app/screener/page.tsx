"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useScreenerPresets } from "@/hooks/use-screener-presets";
import type {
  ScreenerFilters,
  ScreenerResult,
  SortDir,
  SortKey,
} from "@/types/screener";

const SECTORS = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Consumer Cyclical",
  "Consumer Defensive",
  "Industrials",
  "Energy",
  "Utilities",
  "Real Estate",
  "Basic Materials",
  "Communication Services",
];

const DEFAULT_FILTERS: ScreenerFilters = {
  exchange: "",
  sector: "",
  marketCapMin: "",
  marketCapMax: "",
  priceMin: "",
  priceMax: "",
};

const RESULT_LIMIT = 50;

function fmt(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

export default function ScreenerPage() {
  const router = useRouter();
  const [tickerInput, setTickerInput] = useState("");
  const [filters, setFilters] = useState<ScreenerFilters>(DEFAULT_FILTERS);
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [screenerError, setScreenerError] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { add, has } = useWatchlist();
  const { presets, save: savePreset, remove: removePreset } = useScreenerPresets();
  const [presetName, setPresetName] = useState("");

  function setField(field: keyof ScreenerFilters, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  async function search() {
    setLoading(true);
    setSearched(true);
    setScreenerError(false);
    try {
      const params = new URLSearchParams({ limit: String(RESULT_LIMIT) });
      if (filters.exchange) params.set("exchange", filters.exchange);
      if (filters.sector) params.set("sector", filters.sector);
      if (filters.marketCapMin) params.set("marketCapMoreThan", filters.marketCapMin);
      if (filters.marketCapMax) params.set("marketCapLowerThan", filters.marketCapMax);
      if (filters.priceMin) params.set("priceMoreThan", filters.priceMin);
      if (filters.priceMax) params.set("priceLowerThan", filters.priceMax);

      const res = await fetch(`/api/screener?${params}`);
      if (res.status === 402 || res.status === 403) {
        setScreenerError(true);
        setResults([]);
        return;
      }
      const data: ScreenerResult[] = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFilters(DEFAULT_FILTERS);
    setResults([]);
    setSearched(false);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...results].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
    return sortDir === "asc" ? cmp : -cmp;
  });

  function SortHeader({
    col,
    label,
    className,
  }: {
    col: SortKey;
    label: string;
    className?: string;
  }) {
    const active = sortKey === col;
    return (
      <th
        className={`cursor-pointer select-none px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:text-foreground ${className ?? ""}`}
        onClick={() => toggleSort(col)}
      >
        {label}
        {active && (
          <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
        )}
      </th>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">종목 스크리너</h1>

      <Card className="mb-4">
        <CardContent className="pt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">티커 직접 검색</p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const t = tickerInput.trim().toUpperCase();
              if (t) router.push(`/stock/${t}`);
            }}
          >
            <input
              type="text"
              placeholder="예: AAPL, MSFT, TSLA"
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
              className="h-8 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
            />
            <Button type="submit" disabled={!tickerInput.trim()}>
              이동
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">거래소</label>
              <select
                value={filters.exchange}
                onChange={(e) => setField("exchange", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              >
                <option value="">전체</option>
                <option value="NYSE">NYSE</option>
                <option value="NASDAQ">NASDAQ</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">섹터</label>
              <select
                value={filters.sector}
                onChange={(e) => setField("sector", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              >
                <option value="">전체</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                시가총액 최소 (USD)
              </label>
              <input
                type="number"
                placeholder="예: 1000000000"
                value={filters.marketCapMin}
                onChange={(e) => setField("marketCapMin", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                시가총액 최대 (USD)
              </label>
              <input
                type="number"
                placeholder="예: 100000000000"
                value={filters.marketCapMax}
                onChange={(e) => setField("marketCapMax", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                주가 최소 (USD)
              </label>
              <input
                type="number"
                placeholder="예: 10"
                value={filters.priceMin}
                onChange={(e) => setField("priceMin", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                주가 최대 (USD)
              </label>
              <input
                type="number"
                placeholder="예: 500"
                value={filters.priceMax}
                onChange={(e) => setField("priceMax", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {presets.length > 0 && (
            <div className="mt-4">
              <label className="mb-1 block text-xs text-muted-foreground">프리셋 불러오기</label>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <div key={p.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setFilters(p.filters)}
                      className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs hover:bg-muted transition-colors"
                    >
                      {p.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => removePreset(p.id)}
                      className="rounded text-xs text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`${p.name} 삭제`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button onClick={search} disabled={loading}>
              {loading ? "검색 중..." : "검색"}
            </Button>
            <Button variant="outline" onClick={reset}>
              초기화
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <input
                type="text"
                placeholder="프리셋 이름"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="h-8 rounded-lg border border-border bg-background px-3 text-sm w-32"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!presetName.trim()}
                onClick={() => {
                  const saved = savePreset(presetName.trim(), filters);
                  if (saved) setPresetName("");
                }}
              >
                프리셋 저장
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {searched && !loading && screenerError && (
        <div className="rounded-xl border border-border bg-muted/30 py-8 text-center">
          <p className="mb-1 text-sm font-medium">스크리너 기능은 FMP 유료 플랜 필요</p>
          <p className="text-xs text-muted-foreground">
            위의 티커 직접 검색으로 종목 상세 페이지에 접근하세요
          </p>
        </div>
      )}

      {searched && !loading && !screenerError && results.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          조건에 맞는 종목이 없습니다
        </p>
      )}

      {sorted.length > 0 && (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <SortHeader col="symbol" label="티커" />
                  <SortHeader col="companyName" label="회사명" />
                  <SortHeader col="sector" label="섹터" />
                  <SortHeader col="marketCap" label="시가총액" className="text-right" />
                  <SortHeader col="price" label="주가" className="text-right" />
                  <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                    관심종목
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr
                    key={r.symbol}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-3 py-2 font-medium">
                      <Link
                        href={`/stock/${r.symbol}`}
                        className="hover:text-primary hover:underline"
                      >
                        {r.symbol}
                      </Link>
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2 text-muted-foreground">
                      {r.companyName}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="text-xs">
                        {r.sector || "—"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {r.marketCap ? fmt(r.marketCap) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      ${r.price?.toFixed(2) ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="xs"
                        variant={has(r.symbol) ? "secondary" : "outline"}
                        onClick={() => add(r.symbol, r.companyName)}
                        disabled={has(r.symbol)}
                      >
                        {has(r.symbol) ? "추가됨" : "+ 관심종목"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-3 py-2 text-right text-xs text-muted-foreground">
              {sorted.length}개 결과 (최대 {RESULT_LIMIT}개)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
