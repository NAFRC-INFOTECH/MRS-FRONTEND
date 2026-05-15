import { useMemo, useState } from "react";
import { ArrowRightLeft, CreditCard, ReceiptText, UserRoundCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePaypointReferredPatientsQuery } from "@/api-integration/queries/patients";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAllInvoicesQuery, PAYMENT_STATUS } from "@/api-integration/queries/invoices";
import { formatCurrency } from "@/Pages/adminPages/createPriceListsPage/components/priceListTypes";
import { buildPaypointRows, summarizePaypointRows } from "./paypointPatients";

type Period = "daily" | "monthly" | "yearly";

export default function PaypointDashboard() {
  const navigate = useNavigate();
  const q = usePaypointReferredPatientsQuery();
  const invoicesQuery = useAllInvoicesQuery();

  const [period, setPeriod] = useState<Period>("daily");
  const [dailyDate, setDailyDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [monthlyDate, setMonthlyDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });
  const [yearlyDate, setYearlyDate] = useState(() => String(new Date().getFullYear()));

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 15 }, (_, idx) => String(currentYear - idx));
  }, []);

  const range = useMemo(() => {
    if (period === "daily") {
      const [y, m, d] = dailyDate.split("-").map(Number);
      const start = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
      const end = new Date(y, (m || 1) - 1, (d || 1) + 1, 0, 0, 0, 0);
      return { start, end };
    }
    if (period === "monthly") {
      const [y, m] = monthlyDate.split("-").map(Number);
      const start = new Date(y, (m || 1) - 1, 1, 0, 0, 0, 0);
      const end = new Date(y, m || 1, 1, 0, 0, 0, 0);
      return { start, end };
    }
    const y = Number(yearlyDate) || new Date().getFullYear();
    const start = new Date(y, 0, 1, 0, 0, 0, 0);
    const end = new Date(y + 1, 0, 1, 0, 0, 0, 0);
    return { start, end };
  }, [period, dailyDate, monthlyDate, yearlyDate]);

  const inRange = (iso?: string) => {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return false;
    return t >= range.start.getTime() && t < range.end.getTime();
  };

  const filteredPatients = useMemo(() => {
    const patients = (q.data as any[]) || [];
    return patients.filter((p) => inRange(p.updatedAt || p.createdAt));
  }, [q.data, range]);

  const rows = useMemo(() => buildPaypointRows(filteredPatients), [filteredPatients]);
  const summary = useMemo(() => summarizePaypointRows(rows), [rows]);

  const latestInvoiceByPatientId = useMemo(() => {
    const ids = new Set(rows.map((r) => r.id));
    const sorted = [...(invoicesQuery.data || [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const map = new Map<string, (typeof sorted)[number]>();
    for (const inv of sorted) {
      const pid = String(inv.patientId || "");
      if (!pid || !ids.has(pid)) continue;
      if (!map.has(pid)) map.set(pid, inv);
    }
    return map;
  }, [invoicesQuery.data, rows]);

  const clearedCount = useMemo(() => {
    return rows.filter((r) => {
      const inv = latestInvoiceByPatientId.get(r.id);
      if (!inv) return false;
      return inv.paymentStatus === PAYMENT_STATUS.PAID && inRange(inv.updatedAt || inv.createdAt);
    }).length;
  }, [rows, latestInvoiceByPatientId, range]);

  const awaitingClearanceCount = useMemo(() => {
    return Math.max(0, rows.length - clearedCount);
  }, [rows.length, clearedCount]);

  const periodLabel = useMemo(() => {
    if (period === "daily") return dailyDate;
    if (period === "monthly") return monthlyDate;
    return yearlyDate;
  }, [period, dailyDate, monthlyDate, yearlyDate]);

  const invoiceStats = useMemo(() => {
    const list = invoicesQuery.data || [];
    const inPeriod = list.filter((inv) => inRange(inv.updatedAt || inv.createdAt));
    const paid = inPeriod.filter((inv) => inv.paymentStatus === PAYMENT_STATUS.PAID);
    const awaiting = inPeriod.filter((inv) => inv.paymentStatus === PAYMENT_STATUS.AWAITING);
    const canceled = inPeriod.filter((inv) => inv.paymentStatus === PAYMENT_STATUS.CANCELED);
    const paidValue = paid.reduce((sum, inv) => sum + (inv.totalCost || 0), 0);
    return {
      total: inPeriod.length,
      paid: paid.length,
      awaiting: awaiting.length,
      canceled: canceled.length,
      paidValue,
    };
  }, [invoicesQuery.data, range]);

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Paypoint Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor patients currently routed to the paypoint desk and keep track of operational workload
            before opening the detailed queue list.
          </p>
        </div>
        <Button onClick={() => navigate("/paypoint/patients")}>
          <ArrowRightLeft className="h-4 w-4" />
          Open Patients List
        </Button>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)} className="w-full space-y-4">
        <div className="flex items-center justify-between gap-3">
          <TabsList className="grid w-full grid-cols-3 max-w-[360px]">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="m-0">
            <input
              type="date"
              value={dailyDate}
              onChange={(e) => setDailyDate(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            />
          </TabsContent>

          <TabsContent value="monthly" className="m-0">
            <input
              type="month"
              value={monthlyDate}
              onChange={(e) => setMonthlyDate(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            />
          </TabsContent>

          <TabsContent value="yearly" className="m-0">
            <Select value={yearlyDate} onValueChange={setYearlyDate}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TabsContent>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="w-full rounded-md bg-green-50 dark:bg-green-900/20 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Successful Payments</CardTitle>
                <CardDescription>{formatCurrency(invoiceStats.paidValue)} total</CardDescription>
              </div>
              <ReceiptText className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{invoiceStats.paid}</div>
            </CardContent>
          </Card>

          <Card className="w-full rounded-md bg-blue-50 dark:bg-blue-900/20 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Total Paypoint Patients</CardTitle>
                <CardDescription>Patients updated during selected period</CardDescription>
              </div>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.total}</div>
            </CardContent>
          </Card>

          <Card className="w-full rounded-md bg-yellow-50 dark:bg-yellow-900/20 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Awaiting Clearance</CardTitle>
                <CardDescription>Pending desk completion</CardDescription>
              </div>
              <CreditCard className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{awaitingClearanceCount}</div>
            </CardContent>
          </Card>

          <Card className="w-full rounded-md bg-purple-50 dark:bg-purple-900/20 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Personnel Desk</CardTitle>
                <CardDescription>Soldier and veteran billing lane</CardDescription>
              </div>
              <UserRoundCheck className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.personnel}</div>
            </CardContent>
          </Card>

          <Card className="w-full rounded-md bg-orange-50 dark:bg-orange-900/20 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Civilian Desk</CardTitle>
                <CardDescription>Civilian and dependent billing lane</CardDescription>
              </div>
              <Users className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{summary.civilian}</div>
            </CardContent>
          </Card>
        </div>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Desk Workflow Overview</CardTitle>
            <CardDescription>
              Use the dashboard for queue visibility, then open the patients list to complete per-patient desk
              actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">1. Receive Transfer</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Patients appear here after the recording desk transfers them to paypoint.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">2. Review Queue</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Confirm whether the patient belongs to the civilian or personnel billing lane.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">3. Clear Desk Step</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Complete desk processing from the patients list when the paypoint review is done.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Snapshot</CardTitle>
            <CardDescription>Quick operational picture for {periodLabel}.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Total Paypoint Patients</p>
                <p className="text-xs text-muted-foreground">Patients in the selected period</p>
              </div>
              <span className="text-xl font-semibold">{summary.total}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Awaiting Clearance</p>
                <p className="text-xs text-muted-foreground">Pending desk completion</p>
              </div>
              <span className="text-xl font-semibold">{awaitingClearanceCount}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Completed Desk Reviews</p>
                <p className="text-xs text-muted-foreground">Patients already cleared from paypoint</p>
              </div>
              <span className="text-xl font-semibold">{clearedCount}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Paid Invoices</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(invoiceStats.paidValue)} collected</p>
              </div>
              <span className="text-xl font-semibold">{invoiceStats.paid}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Patients List</p>
                <p className="text-xs text-muted-foreground">Open the operational queue table</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/paypoint/patients")}>
                <ReceiptText className="h-4 w-4" />
                Open
              </Button>
            </div>

            {(q.isLoading || invoicesQuery.isLoading) && (
              <p className="text-sm text-muted-foreground">Loading paypoint dashboard data...</p>
            )}

            {(q.isError || invoicesQuery.isError) && !(q.isLoading || invoicesQuery.isLoading) && (
              <p className="text-sm text-red-600">Unable to load paypoint dashboard data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
