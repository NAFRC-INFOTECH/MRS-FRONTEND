import { useMemo, useState } from "react";
import { ClipboardList, FileSpreadsheet, ReceiptText, UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/api-integration/redux/selectors";
import { PAYMENT_STATUS, useInvoicesQuery } from "@/api-integration/queries/invoices";
import { useNHIAStatsQuery, usePatientsQuery, type Patient } from "@/api-integration/queries/patients";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/Pages/adminPages/createPriceListsPage/components/priceListTypes";

type Period = "daily" | "monthly" | "yearly";

export default function RecordingDashboard() {
  const navigate = useNavigate();
  const user = useUser();

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

  const statsParams = useMemo(() => {
    const value = period === "daily" ? dailyDate : period === "monthly" ? monthlyDate : yearlyDate;
    return { period, value };
  }, [period, dailyDate, monthlyDate, yearlyDate]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 15 }, (_, idx) => String(currentYear - idx));
  }, []);

  const patientsQuery = usePatientsQuery();
  const invoicesQuery = useInvoicesQuery({ createdByRole: "recording" });
  const nhiaStatsQuery = useNHIAStatsQuery(statsParams);

  const periodRange = useMemo(() => {
    const now = new Date();
    if (period === "monthly") {
      const [yRaw, mRaw] = monthlyDate ? monthlyDate.split("-") : [];
      const y = Number(yRaw) || now.getFullYear();
      const m = Number(mRaw) || now.getMonth() + 1;
      const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
      const end = new Date(y, m, 1, 0, 0, 0, 0);
      return { start, end };
    }
    if (period === "yearly") {
      const y = Number(yearlyDate) || now.getFullYear();
      const start = new Date(y, 0, 1, 0, 0, 0, 0);
      const end = new Date(y + 1, 0, 1, 0, 0, 0, 0);
      return { start, end };
    }
    const [yRaw, mRaw, dRaw] = dailyDate ? dailyDate.split("-") : [];
    const y = Number(yRaw) || now.getFullYear();
    const m = Number(mRaw) || now.getMonth() + 1;
    const d = Number(dRaw) || now.getDate();
    const start = new Date(y, m - 1, d, 0, 0, 0, 0);
    const end = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
    return { start, end };
  }, [period, dailyDate, monthlyDate, yearlyDate]);

  const patients = useMemo(() => (patientsQuery.data || []) as Patient[], [patientsQuery.data]);

  const registryStats = useMemo(() => {
    const inPeriod = patients.filter((p) => {
      const t = new Date(p.createdAt || "").getTime();
      if (!t || Number.isNaN(t)) return false;
      return t >= periodRange.start.getTime() && t < periodRange.end.getTime();
    });
    const totalRegistered = inPeriod.length;
    const personnelRegistered = inPeriod.filter((p) => !!p.veteran).length;
    const civilianRegistered = totalRegistered - personnelRegistered;

    const queuePaypoint = patients.filter((p) => (p.patientQueue || "").toLowerCase() === "paypoint" || p.patientStatus === "paypoint").length;
    const queueNHIA = patients.filter((p) => (p.patientQueue || "").toLowerCase() === "nhia" || p.patientStatus === "nhia").length;
    const queueGOPD = patients.filter((p) => (p.patientQueue || "").toLowerCase() === "godp_vitals" || p.patientStatus === "gopd").length;

    return {
      totalRegistered,
      civilianRegistered,
      personnelRegistered,
      queuePaypoint,
      queueNHIA,
      queueGOPD,
    };
  }, [patients, periodRange]);

  const invoiceStats = useMemo(() => {
    const invoices = invoicesQuery.data || [];
    const inPeriod = invoices.filter((inv) => {
      const t = new Date(inv.createdAt).getTime();
      if (!t || Number.isNaN(t)) return false;
      return t >= periodRange.start.getTime() && t < periodRange.end.getTime();
    });

    const awaiting = inPeriod.filter((i) => i.paymentStatus === PAYMENT_STATUS.AWAITING);
    const paid = inPeriod.filter((i) => i.paymentStatus === PAYMENT_STATUS.PAID);
    const canceled = inPeriod.filter((i) => i.paymentStatus === PAYMENT_STATUS.CANCELED);
    const paidValue = paid.reduce((sum, i) => sum + (Number(i.totalCost) || 0), 0);

    return {
      total: inPeriod.length,
      awaiting: awaiting.length,
      paid: paid.length,
      canceled: canceled.length,
      paidValue,
    };
  }, [invoicesQuery.data, periodRange]);

  const recentPatients = useMemo(() => {
    return [...patients]
      .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
      .slice(0, 6);
  }, [patients]);

  const recentInvoices = useMemo(() => {
    return [...(invoicesQuery.data || [])].slice(0, 6);
  }, [invoicesQuery.data]);

  const nhiaStats = nhiaStatsQuery.data;

  const getQueueBadge = (p: Patient) => {
    const q = String(p.patientQueue || "").toLowerCase();
    if (q === "nhia" || p.patientStatus === "nhia") return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">NHIA</Badge>;
    if (q === "paypoint" || p.patientStatus === "paypoint") return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Paypoint</Badge>;
    if (q === "godp_vitals" || p.patientStatus === "gopd") return <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100">GOPD</Badge>;
    return <Badge variant="outline">-</Badge>;
  };

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Recording Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Quickly register patients, track transfers, and monitor invoice activity from the recording desk.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/recordings/patients-registry")}>
            <ClipboardList className="h-4 w-4" />
            Open Registry
          </Button>
          <Button onClick={() => navigate("/recordings/patients/new")}>
            <UserPlus className="h-4 w-4" />
            Register Patient
          </Button>
        </div>
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
      </Tabs>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="bg-blue-50 dark:bg-blue-900/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Registrations</CardTitle>
              <CardDescription>New patients in selected period</CardDescription>
            </div>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-semibold">{registryStats.totalRegistered}</div>
            <div className="text-xs text-muted-foreground">
              Civilian: {registryStats.civilianRegistered} • Personnel: {registryStats.personnelRegistered}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-900/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Transfers Snapshot</CardTitle>
              <CardDescription>Patients currently in queues</CardDescription>
            </div>
            <ClipboardList className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-semibold">{registryStats.queueNHIA + registryStats.queuePaypoint + registryStats.queueGOPD}</div>
            <div className="text-xs text-muted-foreground">
              NHIA: {registryStats.queueNHIA} • Paypoint: {registryStats.queuePaypoint} • GOPD: {registryStats.queueGOPD}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Invoice Activity</CardTitle>
              <CardDescription>{formatCurrency(invoiceStats.paidValue)} paid in selected period</CardDescription>
            </div>
            <ReceiptText className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-semibold">{invoiceStats.total}</div>
            <div className="text-xs text-muted-foreground">
              Awaiting: {invoiceStats.awaiting} • Paid: {invoiceStats.paid} • Canceled: {invoiceStats.canceled}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>NHIA Decisions</CardTitle>
              <CardDescription>Cleared / not cleared in selected period</CardDescription>
            </div>
            <FileSpreadsheet className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-semibold">{(nhiaStats?.cleared ?? 0) + (nhiaStats?.notCleared ?? 0)}</div>
            <div className="text-xs text-muted-foreground">
              Cleared: {nhiaStats?.cleared ?? 0} • Not cleared: {nhiaStats?.notCleared ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>NHIA Awaiting</CardTitle>
              <CardDescription>Awaiting verification in selected period</CardDescription>
            </div>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-semibold">{nhiaStats?.awaiting ?? 0}</div>
            <div className="text-xs text-muted-foreground">
              Civilian: {nhiaStats?.awaitingCivilian ?? 0} • Personnel: {nhiaStats?.awaitingPersonnel ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Common recording actions</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" onClick={() => navigate("/recordings/patients-registry")}>
              <ClipboardList className="h-4 w-4" />
              Patients Registry
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate("/recordings/patients/new")}>
              <UserPlus className="h-4 w-4" />
              New Patient
            </Button>
            {user?.id && (
              <Button variant="outline" className="justify-start" onClick={() => navigate(`/recordings/staff/${user.id}`)}>
                <Users className="h-4 w-4" />
                My Profile
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>Latest registered patients</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="min-w-full border-t border-gray-200">
                <thead className="bg-[#56bbe3] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left whitespace-nowrap">S/N</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Card No</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Patient</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Queue</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {patientsQuery.isLoading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Loading patients...
                      </td>
                    </tr>
                  )}
                  {patientsQuery.isError && !patientsQuery.isLoading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-red-600">
                        Failed to load patients.
                      </td>
                    </tr>
                  )}
                  {!patientsQuery.isLoading && !patientsQuery.isError && recentPatients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <div className="space-y-1">
                          <p className="font-medium">No patients found.</p>
                          <p className="text-sm text-muted-foreground">New registrations will appear here.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!patientsQuery.isLoading &&
                    !patientsQuery.isError &&
                    recentPatients.map((p, idx) => {
                      const name = [p.surname, p.firstname, p.middlename].filter(Boolean).join(" ").trim();
                      const card = p.veteran ? p.serviceNumber : p.membershipNumber;
                      return (
                        <tr key={p._id} className="border-b border-gray-200 even:bg-[#f9f9f9]">
                          <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{card || "-"}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-medium">{name || "-"}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{getQueueBadge(p)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest invoices created across patients</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="min-w-full border-t border-gray-200">
                <thead className="bg-[#56bbe3] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left whitespace-nowrap">S/N</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Patient</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Amount</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesQuery.isLoading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Loading invoices...
                      </td>
                    </tr>
                  )}
                  {invoicesQuery.isError && !invoicesQuery.isLoading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-red-600">
                        Failed to load invoices.
                      </td>
                    </tr>
                  )}
                  {!invoicesQuery.isLoading && !invoicesQuery.isError && recentInvoices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <div className="space-y-1">
                          <p className="font-medium">No invoices found.</p>
                          <p className="text-sm text-muted-foreground">Invoices will appear here once created.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!invoicesQuery.isLoading &&
                    !invoicesQuery.isError &&
                    recentInvoices.map((inv, idx) => (
                      <tr key={inv._id} className="border-b border-gray-200 even:bg-[#f9f9f9]">
                        <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium">{inv.patientName}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(inv.totalCost)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {inv.paymentStatus === PAYMENT_STATUS.PAID ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
                          ) : inv.paymentStatus === PAYMENT_STATUS.CANCELED ? (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Canceled</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Awaiting</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {inv.createdAt ? new Date(inv.createdAt).toLocaleString() : "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
