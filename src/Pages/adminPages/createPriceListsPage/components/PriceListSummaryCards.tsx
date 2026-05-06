import {
  BedDouble,
  ClipboardList,
  Pill,
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
import { formatCurrency, type PriceSummary } from "./priceListTypes";

type PriceListSummaryCardsProps = {
  summary: PriceSummary;
};

export function PriceListSummaryCards({ summary }: PriceListSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      
      <Card className="bg-blue-50 dark:bg-blue-900/20 shadow-none max-h-[10rem]">
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

      <Card className="bg-green-50 dark:bg-green-900/20 shadow-none max-h-[10rem]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Active Items</CardTitle>
            <CardDescription>Items currently available for billing</CardDescription>
          </div>
          <Wallet className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{summary.activeItems}</div>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 dark:bg-purple-900/20 shadow-none max-h-[10rem]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Drugs</CardTitle>
            <CardDescription>Medication price entries</CardDescription>
          </div>
          <Pill className="h-5 w-5 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{summary.drugs}</div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 dark:bg-orange-900/20 shadow-none max-h-[10rem]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Service Items</CardTitle>
            <CardDescription>Consultation, bed, lab, and procedure fees</CardDescription>
          </div>
          <Stethoscope className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{summary.services}</div>
        </CardContent>
      </Card>

      <Card className="bg-red-50 dark:bg-red-900/20 shadow-none max-h-[10rem]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Active Value</CardTitle>
            <CardDescription>Total of active listed prices</CardDescription>
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
