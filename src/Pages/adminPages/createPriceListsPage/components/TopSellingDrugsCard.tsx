import { useMemo } from "react";
import { useTopSellingDrugsQuery } from "@/api-integration/queries/priceList";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function TopSellingDrugsCard() {
  const q = useTopSellingDrugsQuery({ limit: 5, activeOnly: false });
  const rows = q.data ?? [];

  const maxSold = useMemo(() => {
    return rows.reduce((m, r) => Math.max(m, Number(r.soldQuantity || 0)), 0);
  }, [rows]);

  const getIndicatorClassName = (idx: number, pct: number) => {
    if (idx === 0) return "bg-[#56bbe3]";
    if (idx === 1) return "bg-emerald-500";
    if (idx === 2) return "bg-amber-500";
    if (idx === 3) return "bg-orange-500";
    if (idx === 4) return "bg-rose-500";
    if (pct >= 75) return "bg-emerald-500";
    if (pct >= 50) return "bg-amber-500";
    if (pct >= 25) return "bg-orange-500";
    return "bg-rose-500";
  };

  return (
    <Card className="w-full lg:max-w-[15rem]">
      <CardContent className="px-4 space-y-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold leading-tight">Top 5 Selling Drugs</div>
          <div className="text-xs text-muted-foreground leading-tight">By dispensed quantity</div>
        </div>

        {q.isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}

        {q.isError && !q.isLoading && (
          <div className="text-sm text-red-600">Failed to load</div>
        )}

        {!q.isLoading && !q.isError && rows.length === 0 && (
          <div className="text-sm text-muted-foreground">No sales yet</div>
        )}

        {!q.isLoading && !q.isError && rows.length > 0 && (
          <div className="space-y-3">
            {rows.map((r, idx) => {
              const sold = Number(r.soldQuantity || 0);
              const pct = maxSold > 0 ? Math.round((sold / maxSold) * 100) : 0;
              return (
                <div key={r._id} className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">
                        <span className="text-muted-foreground mr-1">{idx + 1}.</span>
                        {r.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        <span className="mr-2">Sold: {sold}</span>
                        <span>Stock: {Number(r.stockQuantity || 0)}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">{pct}%</Badge>
                  </div>
                  <Progress value={pct} className="h-[2px]" indicatorClassName={getIndicatorClassName(idx, pct)} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
