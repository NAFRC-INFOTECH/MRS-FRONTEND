import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CalendarClock, ClipboardList, Film, ScanLine, X } from "lucide-react";
import { useXrayReferralsQuery, type XrayReferral } from "@/api-integration/queries/xray";

type Period = "daily" | "monthly" | "yearly";

const normalizeTests = (raw?: string) => {
  return String(raw || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

const formatDateInput = (d: Date) => d.toISOString().slice(0, 10);
const formatMonthInput = (d: Date) => d.toISOString().slice(0, 7);

export default function XrayResultsTable({ patientId }: { patientId: string }) {
  const [period, setPeriod] = useState<Period>("daily");
  const [dailyDate, setDailyDate] = useState(() => formatDateInput(new Date()));
  const [monthlyDate, setMonthlyDate] = useState(() => formatMonthInput(new Date()));
  const [yearlyDate, setYearlyDate] = useState(() => String(new Date().getFullYear()));
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 15 }, (_, idx) => String(currentYear - idx));
  }, []);

  const params = useMemo(() => {
    const value = period === "daily" ? dailyDate : period === "monthly" ? monthlyDate : yearlyDate;
    return { patientId, period, value };
  }, [patientId, period, dailyDate, monthlyDate, yearlyDate]);

  const q = useXrayReferralsQuery(params);

  const rows = useMemo(() => {
    const list = (q.data || []) as XrayReferral[];
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [q.data]);

  const latest = rows[0] || null;
  const selected = useMemo(() => rows.find((r) => r.id === selectedId) || null, [rows, selectedId]);

  const openDetails = (id: string) => {
    setSelectedId(id);
    setOpen(true);
  };

  const statusBadge = (status: XrayReferral["status"]) => {
    if (status === "COMPLETED") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    if (status === "RECEIVED") return <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100">Received</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
  };

  const renderDetails = (r: XrayReferral) => {
    const tests = normalizeTests(r.examinationRequired);
    const results = r.testResults || {};
    const resultCount = Object.values(results).filter((v) => String(v || "").trim().length > 0).length;
    const totalCount = tests.length;
    const patientName = [r.surname, r.forenames].filter(Boolean).join(", ").trim();

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Patient</div>
            <div className="font-medium">{patientName || "-"}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="mt-1">{statusBadge(r.status)}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Imaging Area</div>
            <div className="font-medium">{r.imagingArea || "-"}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">To</div>
            <div className="font-medium">{r.to || "-"}</div>
          </div>
          <div className="rounded-md border p-3 md:col-span-2">
            <div className="text-xs text-muted-foreground">Requested</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {tests.length > 0 ? (
                tests.slice(0, 8).map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
              {tests.length > 8 && <Badge variant="outline">+{tests.length - 8} more</Badge>}
            </div>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white">
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4" />
              <span className="font-semibold">X-ray Results</span>
            </div>
            <div className="text-xs opacity-90">
              {resultCount}/{totalCount || resultCount} filled
            </div>
          </div>
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-md">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#f5f3ff]">
                <tr>
                  <th className="pl-4 py-2 text-left text-md font-semibold text-gray-700 whitespace-nowrap border-r border-gray-200">S/N</th>
                  <th className="px-4 py-2 text-left text-md font-semibold text-gray-700 border-r border-gray-200">Test</th>
                  <th className="px-4 py-2 text-left text-md font-semibold text-gray-700">Result</th>
                </tr>
              </thead>
              <tbody>
                {(tests.length ? tests : Object.keys(results)).map((t, idx) => {
                  const val = String(results[t] || "").trim();
                  return (
                    <tr key={`${t}-${idx}`} className={cn("border-t border-gray-200", idx % 2 === 1 ? "bg-[#fbfbfb]" : "bg-white")}>
                      <td className="px-4 py-2 text-sm whitespace-nowrap border-r border-gray-200">{idx + 1}</td>
                      <td className="px-4 py-2 text-sm border-r border-gray-200">{t || "-"}</td>
                      <td className={cn("px-4 py-2 text-sm", val ? "text-gray-900" : "text-muted-foreground")}>{val || "-"}</td>
                    </tr>
                  );
                })}
                {tests.length === 0 && Object.keys(results).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No tests or results recorded for this referral.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">Radiology Results</div>
            <div className="text-xs text-muted-foreground">Imaging referrals and outcomes for this patient</div>
          </div>
          <Badge variant="outline" className="gap-1">
            <ClipboardList className="h-3.5 w-3.5" />
            {(rows.length || 0).toString()} records
          </Badge>
        </div>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)} className="w-full space-y-3">
          <div className="flex items-center justify-between gap-2">
            <TabsList className="grid w-full grid-cols-3 max-w-[340px]">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>

            {period === "daily" && (
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            )}

            {period === "monthly" && (
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="month"
                  value={monthlyDate}
                  onChange={(e) => setMonthlyDate(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            )}

            {period === "yearly" && (
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
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
              </div>
            )}
          </div>
        </Tabs>
      </div>

      {q.isLoading && <div className="rounded-lg border bg-white p-4 text-sm text-muted-foreground">Loading radiology results...</div>}
      {q.isError && !q.isLoading && <div className="rounded-lg border bg-white p-4 text-sm text-red-600">Failed to load radiology results.</div>}

      {!q.isLoading && !q.isError && latest && (
        <Card className="border-2 border-indigo-600/50 bg-indigo-50/70 dark:bg-indigo-900/20 shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Film className="h-5 w-5 text-indigo-600" />
                Most Recent X-ray Result
              </span>
              {statusBadge(latest.status)}
            </CardTitle>
            <CardDescription>
              {new Date(latest.date).toLocaleString()} • {latest.imagingArea || "Imaging Area -"} • {latest.to || "X-ray"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">{normalizeTests(latest.examinationRequired).length} tests requested</div>
            <Button onClick={() => openDetails(latest.id)} className="bg-indigo-600 text-white hover:bg-indigo-600/85">
              View Details
            </Button>
          </CardContent>
        </Card>
      )}

      {!q.isLoading && !q.isError && rows.length === 0 && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>No X-ray referrals</CardTitle>
            <CardDescription>No X-ray records found for the selected period.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {!q.isLoading && !q.isError && rows.length > 0 && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>X-ray Referrals</CardTitle>
            <CardDescription>Click any row to view requested imaging tests and results.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="min-w-full border-t border-gray-200">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left whitespace-nowrap">S/N</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Imaging Area</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Tests</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Results</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const tests = normalizeTests(r.examinationRequired);
                    const results = r.testResults || {};
                    const filled = Object.values(results).filter((v) => String(v || "").trim().length > 0).length;
                    const total = tests.length || Object.keys(results).length;
                    return (
                      <tr
                        key={r.id}
                        className={cn("border-b border-gray-200 even:bg-[#f9f9f9] cursor-pointer hover:bg-indigo-50", idx === 0 ? "bg-indigo-50" : "")}
                        onClick={() => openDetails(r.id)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(r.date).toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{r.imagingArea || "-"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{statusBadge(r.status)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{tests.length || "-"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {filled}/{total || filled || 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-indigo-600" />
              X-ray Result Details
            </DialogTitle>
            <DialogDescription>{selected ? new Date(selected.date).toLocaleString() : ""}</DialogDescription>
          </DialogHeader>
          {selected ? renderDetails(selected) : <div className="text-sm text-muted-foreground">No record selected.</div>}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
