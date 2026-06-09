import Link from "next/link";
import { Search } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="mb-3 text-3xl font-bold">미국 주식 리서치</h1>
      <p className="mb-8 text-muted-foreground">
        펀더멘털 기반 종목 분석 및 스크리닝 도구
      </p>
      <Link
        href="/screener"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
      >
        <Search className="h-4 w-4" />
        종목 탐색 시작
      </Link>
    </div>
  );
}
