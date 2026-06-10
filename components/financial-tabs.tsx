"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface FinancialTabsProps {
  ticker: string;
}

function fmtAmount(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  return n.toLocaleString();
}

function fmtYear(dateStr: string): string {
  return dateStr ? dateStr.slice(0, 4) + "년" : "";
}

function fmtPct(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

function fmtRatio(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "—";
  return n.toFixed(2);
}

const CHART_COLORS = {
  revenue: "#6366f1",
  operatingIncome: "#22c55e",
  netIncome: "#f59e0b",
  totalAssets: "#6366f1",
  totalLiabilities: "#ef4444",
  totalStockholdersEquity: "#22c55e",
  operatingCashFlow: "#6366f1",
  investingCashFlow: "#f59e0b",
  financingCashFlow: "#ef4444",
};

function LoadingState() {
  return (
    <div className="flex h-48 items-center justify-center">
      <div className="h-6 w-24 animate-pulse rounded bg-muted" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <p className="py-12 text-center text-sm text-destructive">{message}</p>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number | null | undefined)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-right text-xs font-medium text-muted-foreground first:text-left"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50 last:border-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-3 py-2 tabular-nums first:text-left last:text-right"
                >
                  {cell ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface IncomeItem {
  date: string;
  revenue: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
}

function IncomeTab({ ticker }: { ticker: string }) {
  const [data, setData] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/stock/${ticker}/income-statement`)
      .then((r) => r.json())
      .then((d: IncomeItem[]) => setData(Array.isArray(d) ? d.slice(0, 5) : []))
      .catch(() => setError("데이터를 불러올 수 없습니다"))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const chartData = [...data].reverse().map((d) => ({
    year: fmtYear(d.date),
    매출: d.revenue,
    영업이익: d.operatingIncome,
    순이익: d.netIncome,
  }));

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => fmtAmount(v)} tick={{ fontSize: 11 }} width={70} />
          <Tooltip formatter={(v: unknown) => fmtAmount(typeof v === "number" ? v : undefined)} />
          <Legend />
          <Bar dataKey="매출" fill={CHART_COLORS.revenue} radius={[3, 3, 0, 0]} />
          <Bar dataKey="영업이익" fill={CHART_COLORS.operatingIncome} radius={[3, 3, 0, 0]} />
          <Bar dataKey="순이익" fill={CHART_COLORS.netIncome} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <DataTable
        headers={["연도", "매출", "영업이익", "순이익", "EPS"]}
        rows={data.map((d) => [
          fmtYear(d.date),
          fmtAmount(d.revenue),
          fmtAmount(d.operatingIncome),
          fmtAmount(d.netIncome),
          d.eps?.toFixed(2) ?? "—",
        ])}
      />
    </div>
  );
}

interface BalanceItem {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  totalStockholdersEquity: number;
}

function BalanceTab({ ticker }: { ticker: string }) {
  const [data, setData] = useState<BalanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/stock/${ticker}/balance-sheet`)
      .then((r) => r.json())
      .then((d: BalanceItem[]) => setData(Array.isArray(d) ? d.slice(0, 5) : []))
      .catch(() => setError("데이터를 불러올 수 없습니다"))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const chartData = [...data].reverse().map((d) => ({
    year: fmtYear(d.date),
    총자산: d.totalAssets,
    총부채: d.totalLiabilities,
    자본: d.totalStockholdersEquity,
  }));

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => fmtAmount(v)} tick={{ fontSize: 11 }} width={70} />
          <Tooltip formatter={(v: unknown) => fmtAmount(typeof v === "number" ? v : undefined)} />
          <Legend />
          <Bar dataKey="총자산" fill={CHART_COLORS.totalAssets} radius={[3, 3, 0, 0]} />
          <Bar dataKey="총부채" fill={CHART_COLORS.totalLiabilities} radius={[3, 3, 0, 0]} />
          <Bar dataKey="자본" fill={CHART_COLORS.totalStockholdersEquity} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <DataTable
        headers={["연도", "총자산", "총부채", "자본"]}
        rows={data.map((d) => [
          fmtYear(d.date),
          fmtAmount(d.totalAssets),
          fmtAmount(d.totalLiabilities),
          fmtAmount(d.totalStockholdersEquity),
        ])}
      />
    </div>
  );
}

interface CashFlowItem {
  date: string;
  operatingCashFlow: number;
  netCashProvidedByInvestingActivities: number;
  netCashProvidedByFinancingActivities: number;
}

function CashFlowTab({ ticker }: { ticker: string }) {
  const [data, setData] = useState<CashFlowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/stock/${ticker}/cash-flow`)
      .then((r) => r.json())
      .then((d: CashFlowItem[]) => setData(Array.isArray(d) ? d.slice(0, 5) : []))
      .catch(() => setError("데이터를 불러올 수 없습니다"))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const chartData = [...data].reverse().map((d) => ({
    year: fmtYear(d.date),
    영업: d.operatingCashFlow,
    투자: d.netCashProvidedByInvestingActivities,
    재무: d.netCashProvidedByFinancingActivities,
  }));

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => fmtAmount(v)} tick={{ fontSize: 11 }} width={70} />
          <Tooltip formatter={(v: unknown) => fmtAmount(typeof v === "number" ? v : undefined)} />
          <Legend />
          <Line type="monotone" dataKey="영업" stroke={CHART_COLORS.operatingCashFlow} strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="투자" stroke={CHART_COLORS.investingCashFlow} strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="재무" stroke={CHART_COLORS.financingCashFlow} strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>

      <DataTable
        headers={["연도", "영업현금흐름", "투자현금흐름", "재무현금흐름"]}
        rows={data.map((d) => [
          fmtYear(d.date),
          fmtAmount(d.operatingCashFlow),
          fmtAmount(d.netCashProvidedByInvestingActivities),
          fmtAmount(d.netCashProvidedByFinancingActivities),
        ])}
      />
    </div>
  );
}

interface RatiosItem {
  date: string;
  priceToEarningsRatio: number;
  priceToBookRatio: number;
  netProfitMargin: number;
  operatingProfitMargin: number;
  debtToEquityRatio: number;
  returnOnAssets: number;
}

function RatiosTab({ ticker }: { ticker: string }) {
  const [data, setData] = useState<RatiosItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/stock/${ticker}/ratios`)
      .then((r) => r.json())
      .then((d: RatiosItem[]) => setData(Array.isArray(d) ? d.slice(0, 5) : []))
      .catch(() => setError("데이터를 불러올 수 없습니다"))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <DataTable
      headers={["연도", "PER", "PBR", "순이익률", "ROA", "영업이익률", "부채비율"]}
      rows={data.map((d) => [
        fmtYear(d.date),
        fmtRatio(d.priceToEarningsRatio),
        fmtRatio(d.priceToBookRatio),
        fmtPct(d.netProfitMargin),
        fmtPct(d.returnOnAssets),
        fmtPct(d.operatingProfitMargin),
        fmtRatio(d.debtToEquityRatio),
      ])}
    />
  );
}

const TAB_COMPONENTS: Record<string, (ticker: string) => React.ReactNode> = {
  income: (t) => <IncomeTab ticker={t} />,
  balance: (t) => <BalanceTab ticker={t} />,
  cashflow: (t) => <CashFlowTab ticker={t} />,
  ratios: (t) => <RatiosTab ticker={t} />,
};

const TABS = [
  { value: "income", label: "손익계산서" },
  { value: "balance", label: "대차대조표" },
  { value: "cashflow", label: "현금흐름표" },
  { value: "ratios", label: "투자지표" },
] as const;

export function FinancialTabs({ ticker }: FinancialTabsProps) {
  return (
    <Tabs defaultValue="income">
      <TabsList className="w-full justify-start">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-6">
          {TAB_COMPONENTS[tab.value](ticker)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
