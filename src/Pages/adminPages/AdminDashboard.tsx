import { Suspense, lazy, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDepartmentsQuery } from "@/api-integration/queries/departments";
import { useUsersQuery } from "@/api-integration/queries/users";
import { usePatientsQuery, useNHIAStatsQuery } from "@/api-integration/queries/patients";
import { useWardAdmissionsQuery } from "@/api-integration/queries/wards";
import { useInvoicesQuery } from "@/api-integration/queries/invoices";
import type { Invoice } from "@/api-integration/queries/invoices";
import { buildRange, getDefaultValueForPeriod, type DashboardPeriod, toIsoDateOnly } from "./components/adminDashboardTypes";
import AdminDashboardFilters from "./components/AdminDashboardFilters";
const AdminDashboardCards = lazy(() => import("./components/AdminDashboardCards"));
const AdminDashboardCharts = lazy(() => import("./components/AdminDashboardCharts"));

const isWithin = (raw: any, start: Date, end: Date) => {
  const d = raw ? new Date(raw) : null;
  if (!d || !Number.isFinite(d.getTime())) return false;
  return d.getTime() >= start.getTime() && d.getTime() < end.getTime();
};

const bucketKey = (d: Date, period: DashboardPeriod) => {
  if (period === "daily") return String(d.getHours()).padStart(2, "0");
  if (period === "monthly") return String(d.getDate()).padStart(2, "0");
  return String(d.getMonth() + 1).padStart(2, "0");
};

const buildBuckets = (period: DashboardPeriod, range: { start: Date; end: Date }) => {
  if (period === "daily") return Array.from({ length: 24 }, (_, i) => ({ name: String(i).padStart(2, "0"), value: 0 }));
  if (period === "monthly") {
    const start = new Date(range.start.getTime());
    const end = new Date(range.end.getTime());
    const days: { name: string; value: number }[] = [];
    for (let d = new Date(start.getTime()); d.getTime() < end.getTime(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
      days.push({ name: String(d.getDate()).padStart(2, "0"), value: 0 });
    }
    return days;
  }
  return Array.from({ length: 12 }, (_, i) => ({ name: String(i + 1).padStart(2, "0"), value: 0 }));
};

export default function AdminDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("daily");
  const [value, setValue] = useState<string>(() => getDefaultValueForPeriod("daily"));

  const range = useMemo(() => buildRange(period, value), [period, value]);

  const departmentsQ = useDepartmentsQuery();
  const doctorsQ = useUsersQuery("doctor");
  const staffQ = useUsersQuery("staff");
  const patientsQ = usePatientsQuery();
  const admissionsQ = useWardAdmissionsQuery({ status: "all" });

  const paypointPaidQ = useInvoicesQuery({
    paymentStatus: "paid",
    billingRoute: "paypoint",
    paidFrom: range.start.toISOString(),
    paidTo: range.end.toISOString(),
  });

  const nhiaStampedQ = useInvoicesQuery({
    billingRoute: "nhia",
    nhiaStampStatus: "stamped",
  });

  const nhiaStatsQ = useNHIAStatsQuery({ period, value: range.value });

  const newPatients = useMemo(() => {
    const list = (patientsQ.data || []) as any[];
    return list.filter((p) => isWithin(p.createdAt, range.start, range.end)).length;
  }, [patientsQ.data, range.start, range.end]);

  const wardAdmissions = useMemo(() => {
    const list = (admissionsQ.data || []) as any[];
    return list.filter((a) => isWithin(a.admittedAt, range.start, range.end)).length;
  }, [admissionsQ.data, range.start, range.end]);

  const paypointRevenue = useMemo(() => {
    const list = (paypointPaidQ.data || []) as Invoice[];
    return list.reduce((sum, inv) => sum + (Number(inv.totalCost ?? 0) || 0), 0);
  }, [paypointPaidQ.data]);

  const nhiaStampedInRange = useMemo(() => {
    const list = (nhiaStampedQ.data || []) as Invoice[];
    return list.filter((inv) => isWithin((inv as any).nhiaStampedAt || inv.updatedAt, range.start, range.end));
  }, [nhiaStampedQ.data, range.start, range.end]);

  const nhiaClaimValue = useMemo(() => {
    return nhiaStampedInRange.reduce((sum, inv) => sum + (Number((inv as any).nhiaAmountDue ?? 0) || 0), 0);
  }, [nhiaStampedInRange]);

  const routeSplit = useMemo(() => {
    const paypointCleared = (paypointPaidQ.data || []).length;
    const nhiaCleared = nhiaStampedInRange.length;
    return [
      { name: "Paypoint", value: paypointCleared },
      { name: "NHIA", value: nhiaCleared },
    ];
  }, [paypointPaidQ.data, nhiaStampedInRange.length]);

  const revenueSeries = useMemo(() => {
    const buckets = buildBuckets(period, range);
    const idxByName = new Map<string, number>();
    buckets.forEach((b, i) => idxByName.set(b.name, i));
    const list = (paypointPaidQ.data || []) as Invoice[];
    for (const inv of list) {
      const paidAt = (inv as any).paidAt || inv.updatedAt;
      const d = paidAt ? new Date(paidAt) : null;
      if (!d || !Number.isFinite(d.getTime())) continue;
      if (d.getTime() < range.start.getTime() || d.getTime() >= range.end.getTime()) continue;
      const k = bucketKey(d, period);
      const idx = idxByName.get(k);
      if (idx === undefined) continue;
      buckets[idx].value += Number(inv.totalCost ?? 0) || 0;
    }
    return buckets;
  }, [paypointPaidQ.data, period, range]);

  const wardByUnit = useMemo(() => {
    const list = (admissionsQ.data || []) as any[];
    const inRange = list.filter((a) => isWithin(a.admittedAt, range.start, range.end));
    const m = new Map<string, number>();
    for (const a of inRange) {
      const unit = String(a.wardUnit || "").trim() || "Unknown";
      m.set(unit, (m.get(unit) || 0) + 1);
    }
    return Array.from(m.entries())
      .map(([wardUnit, admissions]) => ({ wardUnit, admissions }))
      .sort((a, b) => b.admissions - a.admissions);
  }, [admissionsQ.data, range.start, range.end]);

  const nhiaStatus = useMemo(() => {
    const s: any = nhiaStatsQ.data || {};
    return [
      { name: "Awaiting", value: Number(s.awaiting ?? 0) || 0 },
      { name: "Cleared", value: Number(s.cleared ?? 0) || 0 },
      { name: "Not Cleared", value: Number(s.notCleared ?? 0) || 0 },
    ];
  }, [nhiaStatsQ.data]);

  const periodLabel = useMemo(() => {
    if (range.period === "daily") return `Daily • ${range.value}`;
    if (range.period === "monthly") return `Monthly • ${range.value}`;
    return `Yearly • ${range.value}`;
  }, [range.period, range.value]);

  const kpis = useMemo(() => {
    return {
      periodLabel,
      departmentsTotal: (departmentsQ.data || []).length,
      doctorsTotal: (doctorsQ.data || []).length,
      staffTotal: (staffQ.data || []).length,
      patientsTotal: (patientsQ.data || []).length,
      newPatients,
      wardAdmissions,
      paypointRevenue,
      nhiaClaimValue,
    };
  }, [
    periodLabel,
    departmentsQ.data,
    doctorsQ.data,
    staffQ.data,
    patientsQ.data,
    newPatients,
    wardAdmissions,
    paypointRevenue,
    nhiaClaimValue,
  ]);

  const loading =
    departmentsQ.isLoading ||
    doctorsQ.isLoading ||
    staffQ.isLoading ||
    patientsQ.isLoading ||
    admissionsQ.isLoading ||
    paypointPaidQ.isLoading ||
    nhiaStampedQ.isLoading ||
    nhiaStatsQ.isLoading;

  const error =
    departmentsQ.isError ||
    doctorsQ.isError ||
    staffQ.isError ||
    patientsQ.isError ||
    admissionsQ.isError ||
    paypointPaidQ.isError ||
    nhiaStampedQ.isError ||
    nhiaStatsQ.isError;

  // Handler functions
  const handlePeriodChange = (p: DashboardPeriod) => {
    setPeriod(p);
    setValue(getDefaultValueForPeriod(p));
  };

  const handleValueChange = (v: string) => {
    setValue(v);
  };

  return (
    <div className="min-h-screen py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">
              Operational overview for admin permissions. Period filter applies across dashboard analytics.
            </p>
          </div>
        </div>
        <AdminDashboardFilters
          period={period}
          onPeriodChange={handlePeriodChange}
          value={value}
          onValueChange={handleValueChange}
        />
      </div>

      {/* Status Card */}
      {(loading || error) && (
        <Card className="border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Dashboard Status</CardTitle>
            <CardDescription className="text-gray-600">
              {loading ? "Loading admin dashboard data..." : "Some dashboard data failed to load."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <div className="flex gap-8">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Period Start</span>
                <span className="font-medium">{toIsoDateOnly(range.start)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Period End</span>
                <span className="font-medium">{toIsoDateOnly(range.end)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs Section */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      }>
        <AdminDashboardCards kpis={kpis} />
      </Suspense>

      {/* Charts Section */}
      <Suspense fallback={
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-96 bg-gray-100 rounded-xl animate-pulse ${i === 1 || i === 3 ? 'xl:col-span-2' : ''}`} />
          ))}
        </div>
      }>
        <AdminDashboardCharts
          revenueSeries={revenueSeries}
          routeSplit={routeSplit}
          wardByUnit={wardByUnit}
          nhiaStatus={nhiaStatus}
        />
      </Suspense>
    </div>
  );
}
