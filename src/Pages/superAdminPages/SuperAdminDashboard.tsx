import { Suspense, lazy, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDepartmentsQuery } from '@/api-integration/queries/departments';
import { useUsersQuery } from '@/api-integration/queries/users';
import { usePatientsQuery } from '@/api-integration/queries/patients';
import { useWardAdmissionsQuery } from '@/api-integration/queries/wards';
import { useInvoicesQuery } from '@/api-integration/queries/invoices';
import { useDoctorsQuery } from '@/api-integration/queries/doctors';
import { useNursesQuery } from '@/api-integration/queries/nurses';
import { useVitalsQuery } from '@/api-integration/queries/vitals';
import { useLabReferralsQuery } from '@/api-integration/queries/lab';
import { useXrayReferralsQuery } from '@/api-integration/queries/xray';
import { buildRange, getDefaultValueForPeriod, type DashboardPeriod, toIsoDateOnly } from './components/superAdminDashboardTypes';
import type { SuperAdminDashboardKpis } from './components/SuperAdminDashboardCards';

const SuperAdminDashboardFilters = lazy(() => import('./components/SuperAdminDashboardFilters'));
const SuperAdminDashboardCards = lazy(() => import('./components/SuperAdminDashboardCards'));
const SuperAdminDashboardCharts = lazy(() => import('./components/SuperAdminDashboardCharts'));

const isWithin = (raw: any, start: Date, end: Date): boolean => {
  const d = raw ? new Date(raw) : null;
  if (!d || !Number.isFinite(d.getTime())) return false;
  return d.getTime() >= start.getTime() && d.getTime() < end.getTime();
};

const bucketKey = (d: Date, period: DashboardPeriod): string => {
  if (period === 'daily') return String(d.getHours()).padStart(2, '0');
  if (period === 'monthly') return String(d.getDate()).padStart(2, '0');
  return String(d.getMonth() + 1).padStart(2, '0');
};

const buildBuckets = (period: DashboardPeriod, range: { start: Date; end: Date }): Array<{ name: string; value: number }> => {
  if (period === 'daily') return Array.from({ length: 24 }, (_, i) => ({ name: String(i).padStart(2, '0'), value: 0 }));
  if (period === 'monthly') {
    const start = new Date(range.start.getTime());
    const end = new Date(range.end.getTime());
    const days: Array<{ name: string; value: number }> = [];
    for (let d = new Date(start.getTime()); d.getTime() < end.getTime(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
      days.push({ name: String(d.getDate()).padStart(2, '0'), value: 0 });
    }
    return days;
  }
  return Array.from({ length: 12 }, (_, i) => ({ name: String(i + 1).padStart(2, '0'), value: 0 }));
};

export default function SuperAdminDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>('daily');
  const [value, setValue] = useState<string>(() => getDefaultValueForPeriod('daily'));

  const range = useMemo(() => buildRange(period, value), [period, value]);

  const departmentsQ = useDepartmentsQuery();
  const usersQ = useUsersQuery();
  const doctorsQ = useDoctorsQuery();
  const nursesQ = useNursesQuery();
  const patientsQ = usePatientsQuery();
  const admissionsQ = useWardAdmissionsQuery({ status: 'all' });
  const invoicesQ = useInvoicesQuery();
  const vitalsQ = useVitalsQuery();
  const labReferralsQ = useLabReferralsQuery();
  const xrayReferralsQ = useXrayReferralsQuery();

  const newPatients = useMemo(() => {
    const list = (patientsQ.data || []) as any[];
    return list.filter((p) => isWithin(p.createdAt, range.start, range.end)).length;
  }, [patientsQ.data, range.start, range.end]);

  const wardAdmissions = useMemo(() => {
    const list = (admissionsQ.data || []) as any[];
    return list.filter((a) => isWithin(a.admittedAt, range.start, range.end)).length;
  }, [admissionsQ.data, range.start, range.end]);

  const totalRevenue = useMemo(() => {
    const list = (invoicesQ.data || []) as any[];
    return list.filter(inv => isWithin(inv.createdAt || inv.updatedAt, range.start, range.end))
      .reduce((sum, inv) => sum + (Number(inv.totalCost ?? 0) || 0), 0);
  }, [invoicesQ.data, range.start, range.end]);

  const vitalsCount = useMemo(() => {
    const list = (vitalsQ.data || []) as any[];
    return list.filter((v) => isWithin(v.createdAt || v.updatedAt, range.start, range.end)).length;
  }, [vitalsQ.data, range.start, range.end]);

  const labReferralsCount = useMemo(() => {
    const list = (labReferralsQ.data || []) as any[];
    return list.filter((l) => isWithin(l.createdAt || l.updatedAt, range.start, range.end)).length;
  }, [labReferralsQ.data, range.start, range.end]);

  const xrayReferralsCount = useMemo(() => {
    const list = (xrayReferralsQ.data || []) as any[];
    return list.filter((x) => isWithin(x.createdAt || x.updatedAt, range.start, range.end)).length;
  }, [xrayReferralsQ.data, range.start, range.end]);

  const revenueSeries = useMemo(() => {
    const buckets = buildBuckets(period, range);
    const idxByName = new Map<string, number>();
    buckets.forEach((b, i) => idxByName.set(b.name, i));
    const list = (invoicesQ.data || []) as any[];
    for (const inv of list) {
      const date = inv.createdAt || inv.updatedAt;
      const d = date ? new Date(date) : null;
      if (!d || !Number.isFinite(d.getTime())) continue;
      if (d.getTime() < range.start.getTime() || d.getTime() >= range.end.getTime()) continue;
      const k = bucketKey(d, period);
      const idx = idxByName.get(k);
      if (idx === undefined) continue;
      buckets[idx].value += Number(inv.totalCost ?? 0) || 0;
    }
    return buckets;
  }, [invoicesQ.data, period, range]);

  const patientGrowthSeries = useMemo(() => {
    const buckets = buildBuckets(period, range);
    const idxByName = new Map<string, number>();
    buckets.forEach((b, i) => idxByName.set(b.name, i));
    const list = (patientsQ.data || []) as any[];
    for (const patient of list) {
      const date = patient.createdAt;
      const d = date ? new Date(date) : null;
      if (!d || !Number.isFinite(d.getTime())) continue;
      if (d.getTime() < range.start.getTime() || d.getTime() >= range.end.getTime()) continue;
      const k = bucketKey(d, period);
      const idx = idxByName.get(k);
      if (idx === undefined) continue;
      buckets[idx].value += 1;
    }
    return buckets;
  }, [patientsQ.data, period, range]);

  const wardByUnit = useMemo(() => {
    const list = (admissionsQ.data || []) as any[];
    const inRange = list.filter((a) => isWithin(a.admittedAt, range.start, range.end));
    const m = new Map<string, number>();
    for (const a of inRange) {
      const unit = String(a.wardUnit || '').trim() || 'Unknown';
      m.set(unit, (m.get(unit) || 0) + 1);
    }
    return Array.from(m.entries())
      .map(([wardUnit, admissions]) => ({ wardUnit, admissions }))
      .sort((a, b) => b.admissions - a.admissions);
  }, [admissionsQ.data, range.start, range.end]);

  const referralsSplit = useMemo(() => {
    return [
      { name: 'Lab', value: labReferralsCount },
      { name: 'X-Ray', value: xrayReferralsCount },
    ];
  }, [labReferralsCount, xrayReferralsCount]);

  const userRolesSplit = useMemo(() => {
    const totalDoctors = doctorsQ.data?.length ?? 0;
    const totalNurses = nursesQ.data?.length ?? 0;
    const totalOther = (usersQ.data?.length ?? 0) - totalDoctors - totalNurses;
    return [
      { name: 'Doctors', value: totalDoctors },
      { name: 'Nurses', value: totalNurses },
      { name: 'Other Staff', value: Math.max(0, totalOther) },
    ];
  }, [doctorsQ.data, nursesQ.data, usersQ.data]);

  const periodLabel = useMemo(() => {
    if (range.period === 'daily') return `Daily • ${range.value}`;
    if (range.period === 'monthly') return `Monthly • ${range.value}`;
    return `Yearly • ${range.value}`;
  }, [range.period, range.value]);

  const kpis: SuperAdminDashboardKpis = useMemo(() => {
    return {
      periodLabel,
      totalUsers: (usersQ.data || []).length,
      totalPatients: (patientsQ.data || []).length,
      newPatients,
      totalDoctors: (doctorsQ.data || []).length,
      totalNurses: (nursesQ.data || []).length,
      totalDepartments: (departmentsQ.data || []).length,
      totalInvoices: (invoicesQ.data || []).length,
      totalRevenue,
      totalVitals: vitalsCount,
      totalClinicalDayLists: 0, // Temporarily 0 until we can get proper data
      totalLabReferrals: labReferralsCount,
      totalXrayReferrals: xrayReferralsCount,
      totalWardAdmissions: wardAdmissions,
    };
  }, [
    periodLabel,
    usersQ.data,
    patientsQ.data,
    newPatients,
    doctorsQ.data,
    nursesQ.data,
    departmentsQ.data,
    invoicesQ.data,
    totalRevenue,
    vitalsCount,
    labReferralsCount,
    xrayReferralsCount,
    wardAdmissions,
  ]);

  const loading =
    departmentsQ.isLoading ||
    usersQ.isLoading ||
    doctorsQ.isLoading ||
    nursesQ.isLoading ||
    patientsQ.isLoading ||
    admissionsQ.isLoading ||
    invoicesQ.isLoading ||
    vitalsQ.isLoading ||
    labReferralsQ.isLoading ||
    xrayReferralsQ.isLoading;

  const error =
    departmentsQ.isError ||
    usersQ.isError ||
    doctorsQ.isError ||
    nursesQ.isError ||
    patientsQ.isError ||
    admissionsQ.isError ||
    invoicesQ.isError ||
    vitalsQ.isError ||
    labReferralsQ.isError ||
    xrayReferralsQ.isError;

  return (
    <div className="min-h-screen py-6 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Complete system overview with all activities
            </p>
          </div>
        </div>
        <Suspense fallback={<div className="text-sm text-gray-500 animate-pulse">Loading filters...</div>}>
          <SuperAdminDashboardFilters
            period={period}
            onPeriodChange={(p) => {
              setPeriod(p);
              setValue(getDefaultValueForPeriod(p));
            }}
            value={value}
            onValueChange={setValue}
          />
        </Suspense>
      </div>

      {(loading || error) && (
        <Card className="border-1">
          <CardHeader>
            <CardTitle>Dashboard Status</CardTitle>
            <CardDescription>
              {loading ? 'Loading super admin dashboard data...' : 'Some dashboard data failed to load.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-500">
            <div>Period Start: {toIsoDateOnly(range.start)}</div>
            <div>Period End: {toIsoDateOnly(range.end)}</div>
          </CardContent>
        </Card>
      )}

      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      }>
        <SuperAdminDashboardCards kpis={kpis} />
      </Suspense>

      <Suspense fallback={
        <div className="space-y-6">
          <div className="h-[400px] bg-gray-100 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="h-[400px] bg-gray-100 rounded-xl animate-pulse xl:col-span-2" />
            <div className="h-[400px] bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      }>
        <SuperAdminDashboardCharts
          revenueSeries={revenueSeries}
          patientGrowthSeries={patientGrowthSeries}
          wardAdmissionsByUnit={wardByUnit}
          referralsSplit={referralsSplit}
          userRolesSplit={userRolesSplit}
        />
      </Suspense>
    </div>
  );
}
