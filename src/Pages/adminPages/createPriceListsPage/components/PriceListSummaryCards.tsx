import {
  BedDouble,
  ClipboardList,
  Pill,
  ShoppingCart,
  Stethoscope,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, type PriceSummary, type SummaryPeriod } from "./priceListTypes";
import { useMemo, useState } from "react";
import { PAYMENT_STATUS, useInvoicesQuery } from "@/api-integration/queries/invoices";

type PriceListSummaryCardsProps = {
  summaries?: Record<SummaryPeriod, PriceSummary>;
  isLoading?: boolean;
  monthlyDate: string;
  yearlyDate: string;
  onMonthlyDateChange: (value: string) => void;
  onYearlyDateChange: (value: string) => void;
};

const emptySummary: PriceSummary = {
  period: "monthly",
  from: "",
  to: "",
  totalItems: 0,
  activeItems: 0,
  drugs: 0,
  services: 0,
  servicesValue: 0,
  totalValue: 0,
  totalDrugs: 0,
  totalDrugsInStock: 0,
  totalDrugsSold: 0,
  totalDrugsSoldValue: 0,
};

export default function PriceListSummaryCards({
  summaries,
  isLoading,
  monthlyDate,
  yearlyDate,
  onMonthlyDateChange,
  onYearlyDateChange,
}: PriceListSummaryCardsProps) {
  const [activePeriod, setActivePeriod] = useState<SummaryPeriod>("monthly");
  const resolvedSummaries: Record<SummaryPeriod, PriceSummary> = {
    monthly: summaries?.monthly ?? { ...emptySummary, period: "monthly" },
    yearly: summaries?.yearly ?? { ...emptySummary, period: "yearly" },
  };

  const paypointPaidRange = useMemo(() => {
    const now = new Date();
    if (activePeriod === "yearly") {
      const y = Number(yearlyDate) || now.getFullYear();
      const start = new Date(y, 0, 1, 0, 0, 0, 0);
      const end = new Date(y + 1, 0, 1, 0, 0, 0, 0);
      return { paidFrom: start.toISOString(), paidTo: end.toISOString() };
    }
    const [yRaw, mRaw] = (monthlyDate || "").split("-");
    const y = Number(yRaw) || now.getFullYear();
    const m = Number(mRaw) || now.getMonth() + 1;
    const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const end = new Date(y, m, 1, 0, 0, 0, 0);
    return { paidFrom: start.toISOString(), paidTo: end.toISOString() };
  }, [activePeriod, monthlyDate, yearlyDate]);

  const paypointPaidInvoices = useInvoicesQuery({
    paymentStatus: PAYMENT_STATUS.PAID,
    paidByRole: "paypoint",
    paidFrom: paypointPaidRange.paidFrom,
    paidTo: paypointPaidRange.paidTo,
  });

  const paypointServiceRevenue = useMemo(() => {
    const invoices = paypointPaidInvoices.data || [];
    return invoices.reduce((sum, inv) => {
      const items = inv.items || [];
      const itemsTotal = items.reduce((s, it) => s + (Number(it.totalPrice) || 0), 0);
      return sum + itemsTotal;
    }, 0);
  }, [paypointPaidInvoices.data]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 15 }, (_, idx) => String(currentYear - idx));
  }, []);

  if (isLoading || !summaries) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Tabs value={activePeriod} onValueChange={(v) => setActivePeriod(v as SummaryPeriod)} className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList className="grid w-full grid-cols-2 max-w-[300px]">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
        {activePeriod === "monthly" && (
          <input
            type="month"
            value={monthlyDate}
            onChange={(e) => onMonthlyDateChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        )}
        {activePeriod === "yearly" && (
          <select
            value={yearlyDate}
            onChange={(e) => onYearlyDateChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}
      </div>

      <TabsContent value="monthly">
        <SummaryGrid summary={resolvedSummaries.monthly} paypointServiceRevenue={paypointServiceRevenue} />
      </TabsContent>
      <TabsContent value="yearly">
        <SummaryGrid summary={resolvedSummaries.yearly} paypointServiceRevenue={paypointServiceRevenue} />
      </TabsContent>
    </Tabs>
  );
}

function SummaryGrid({ summary, paypointServiceRevenue }: { summary: PriceSummary; paypointServiceRevenue: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card className="bg-blue-50 dark:bg-blue-900/20 shadow-none max-h-[10rem] rounded-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Total Items</CardTitle>
            <CardDescription>All configured price entries</CardDescription>
          </div>
          <ClipboardList className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{summary.totalItems}</div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 dark:bg-green-900/20 shadow-none max-h-[10rem] rounded-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Active Items</CardTitle>
            <CardDescription>Items available for billing</CardDescription>
          </div>
          <Wallet className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{summary.activeItems}</div>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 dark:bg-purple-900/20 shadow-none max-h-[10rem] rounded-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Drug Sales Ratio</CardTitle>
            <CardDescription>Sold / Total Stock</CardDescription>
          </div>
          <Pill className="h-5 w-5 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold flex items-center gap-1">
            <span>{summary.totalDrugsSold}</span>
            <span className="text-muted-foreground">/</span>
            {/* IF Drugs is running low in stock */}
            {summary.totalDrugsInStock < 20 ? <span className="text-red-500 text-md">{summary.totalDrugsInStock}</span> : <span>{summary.totalDrugsInStock}</span>}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-yellow-50 dark:bg-yellow-900/20 shadow-none max-h-[10rem] rounded-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Sales Value</CardTitle>
            <CardDescription>Total value of sold drugs</CardDescription>
          </div>
          <ShoppingCart className="h-5 w-5 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">{formatCurrency(summary.totalDrugsSoldValue)}</div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 dark:bg-orange-900/20 shadow-none max-h-[10rem] rounded-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Service Items</CardTitle>
            <CardDescription>Paid via paypoint</CardDescription>
          </div>
          <Stethoscope className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">{formatCurrency(paypointServiceRevenue)}</div>
        </CardContent>
      </Card>

      <Card className="bg-red-50 dark:bg-red-900/20 shadow-none max-h-[10rem] rounded-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Inventory Value</CardTitle>
            <CardDescription>Total value of stock & services</CardDescription>
          </div>
          <BedDouble className="h-5 w-5 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold">
            {formatCurrency(summary.totalValue)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
