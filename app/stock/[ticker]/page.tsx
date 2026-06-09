interface StockPageProps {
  params: { ticker: string };
}

export default function StockPage({ params }: StockPageProps) {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{params.ticker.toUpperCase()}</h1>
      <p className="text-muted-foreground">구현 예정 — Issue #6, #7</p>
    </div>
  );
}
