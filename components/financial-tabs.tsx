"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const TABS = [
  { value: "income", label: "손익계산서" },
  { value: "balance", label: "대차대조표" },
  { value: "cashflow", label: "현금흐름표" },
  { value: "ratios", label: "투자지표" },
] as const;

interface FinancialTabsProps {
  ticker: string;
}

export function FinancialTabs({ ticker: _ticker }: FinancialTabsProps) {
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
        <TabsContent key={tab.value} value={tab.value} className="mt-4">
          <p className="py-12 text-center text-sm text-muted-foreground">
            구현 예정 — Issue #7
          </p>
        </TabsContent>
      ))}
    </Tabs>
  );
}
