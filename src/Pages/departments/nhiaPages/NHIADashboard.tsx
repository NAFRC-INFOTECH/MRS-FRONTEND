import { useMemo, useState } from "react";
import { ArrowRightLeft, CreditCard, ReceiptText, ShieldCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNHIAReferredPatientsQuery, useNHIAStatsQuery } from "@/api-integration/queries/patients";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildNHIARows, summarizeNHIARows } from "./nhiaPatients";

type Period = "daily" | "monthly" | "yearly";

export default function NHIADashboard() {
  const navigate = useNavigate();
  const q = useNHIAReferredPatientsQuery();

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

  const statsParams = useMemo(() => {
    const value = period === "daily" ? dailyDate : period === "monthly" ? monthlyDate : yearlyDate;
    return { period, value };
  }, [period, dailyDate, monthlyDate, yearlyDate]);

  const statsQuery = useNHIAStatsQuery(statsParams);

  const rows = useMemo(() => buildNHIARows((q.data as any[]) || []), [q.data]);
  const summary = useMemo(() => summarizeNHIARows(rows), [rows]);

  const nhiaStats = useMemo(() => {
    const s = statsQuery.data;
    const awaiting = s?.awaiting ?? summary.awaiting;
    const civilianAwaiting = s?.awaitingCivilian ?? summary.civilian;
    const personnelAwaiting = s?.awaitingPersonnel ?? summary.personnel;
    const cleared = s?.cleared ?? 0;
    const clearedCivilian = s?.clearedCivilian ?? 0;
    const clearedPersonnel = s?.clearedPersonnel ?? 0;
    const notCleared = s?.notCleared ?? 0;
    const notClearedCivilian = s?.notClearedCivilian ?? 0;
    const notClearedPersonnel = s?.notClearedPersonnel ?? 0;
    return {
      awaiting,
      civilianAwaiting,
      personnelAwaiting,
      cleared,
      clearedCivilian,
      clearedPersonnel,
      notCleared,
      notClearedCivilian,
      notClearedPersonnel,
    };
  }, [statsQuery.data, summary]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">NHIA Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor patients routed to NHIA and keep track of verification workload before opening the
            detailed patients list.
          </p>
        </div>
        <Button onClick={() => navigate("/nhia/patients")}>
          <ArrowRightLeft className="h-4 w-4" />
          Open Patients List
        </Button>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)} className="w-full space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="grid w-full grid-cols-3 max-w-[360px]">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>

          {period === "daily" && (
            <input
              type="date"
              value={dailyDate}
              onChange={(e) => setDailyDate(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            />
          )}

          {period === "monthly" && (
            <input
              type="month"
              value={monthlyDate}
              onChange={(e) => setMonthlyDate(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            />
          )}

          {period === "yearly" && (
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
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="bg-green-50 dark:bg-green-900/20 shadow-none rounded-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Total Cleared</CardTitle>
                <CardDescription>All-time NHIA cleared patients</CardDescription>
              </div>
              <CreditCard className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{nhiaStats.cleared}</div>
            </CardContent>
          </Card>
            
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 shadow-none rounded-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Awaiting Verification</CardTitle>
                <CardDescription>Patients currently in NHIA queue</CardDescription>
              </div>
              <ShieldCheck className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{nhiaStats.awaiting}</div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-900/20 shadow-none rounded-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Not Cleared</CardTitle>
                <CardDescription>All-time NHIA not cleared patients</CardDescription>
              </div>
              <CreditCard className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{nhiaStats.notCleared}</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 shadow-none rounded-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Personnel Desk</CardTitle>
                <CardDescription>
                  Awaiting: {nhiaStats.personnelAwaiting} • Not cleared:{" "}
                  {nhiaStats.notClearedPersonnel}
                </CardDescription>
              </div>
              <CreditCard className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{nhiaStats.clearedPersonnel}</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-900/20 shadow-none rounded-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Civilian Desk</CardTitle>
                <CardDescription>
                  Awaiting: {nhiaStats.civilianAwaiting} • Not cleared:{" "}
                  {nhiaStats.notClearedCivilian}
                </CardDescription>
              </div>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{nhiaStats.clearedCivilian}</div>
            </CardContent>
          </Card>
        </div>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>NHIA Workflow Overview</CardTitle>
            <CardDescription>
              Use the dashboard for queue visibility, then open the patients list to complete per-patient
              NHIA verification actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">1. Receive Transfer</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Patients appear here after the recording desk transfers them to NHIA.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">2. Verify Coverage</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Review the patient card details and confirm the correct NHIA processing lane.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">3. Complete Desk Step</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Finalize the NHIA desk step from the patients list when verification is done.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Snapshot</CardTitle>
            <CardDescription>Quick operational picture for the current NHIA desk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Awaiting Verification</p>
                <p className="text-xs text-muted-foreground">Patients still pending NHIA decision</p>
              </div>
              <span className="text-xl font-semibold">{nhiaStats.awaiting}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Total Cleared</p>
                <p className="text-xs text-muted-foreground">All-time NHIA cleared patients</p>
              </div>
              <span className="text-xl font-semibold">{nhiaStats.cleared}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Patients List</p>
                <p className="text-xs text-muted-foreground">Open the operational queue table</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/nhia/patients")}>
                <ReceiptText className="h-4 w-4" />
                Open
              </Button>
            </div>

            {(q.isLoading || statsQuery.isLoading) && (
              <p className="text-sm text-muted-foreground">Loading NHIA dashboard data...</p>
            )}

            {(q.isError || statsQuery.isError) && !(q.isLoading || statsQuery.isLoading) && (
              <p className="text-sm text-red-600">Unable to load NHIA dashboard data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
