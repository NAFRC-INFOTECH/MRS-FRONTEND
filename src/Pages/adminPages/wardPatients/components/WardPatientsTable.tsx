import { useMemo, useState } from "react";
import { useWardAdmissionsQuery, type WardAdmissionRow } from "@/api-integration/queries/wards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PrescribeMoreDrugsModal from "./PrescribeMoreDrugsModal";
import type { TimePeriodFilter, WardStatusFilter, WardUnitFilter } from "./wardPatientsTypes";
import { wardUnitLabel } from "./wardPatientsTypes";

const normalize = (v: string) => v.trim().toLowerCase();

const formatPeriodDefault = (period: TimePeriodFilter) => {
  const now = new Date();
  if (period === "daily") return now.toISOString().slice(0, 10);
  if (period === "monthly") return now.toISOString().slice(0, 7);
  return String(now.getFullYear());
};

const dateKey = (d: Date, period: TimePeriodFilter) => {
  const iso = d.toISOString();
  if (period === "daily") return iso.slice(0, 10);
  if (period === "monthly") return iso.slice(0, 7);
  return iso.slice(0, 4);
};

export default function WardPatientsTable({
  wardUnit,
  status,
  period,
  periodValue,
  search,
}: {
  wardUnit: WardUnitFilter;
  status: WardStatusFilter;
  period: TimePeriodFilter;
  periodValue: string;
  search: string;
}) {
  const q = useWardAdmissionsQuery({
    wardUnit: wardUnit === "all" ? undefined : wardUnit,
    status: status === "all" ? "all" : status,
  });

  const effectivePeriodValue = periodValue || formatPeriodDefault(period);

  const rows = useMemo(() => {
    const list = (q.data || []) as WardAdmissionRow[];
    const needle = normalize(search || "");
    const filtered = list
      .filter((r) => {
        if (!effectivePeriodValue) return true;
        const admittedAt = new Date(r.admittedAt as any);
        if (!Number.isFinite(admittedAt.getTime())) return false;
        return dateKey(admittedAt, period) === effectivePeriodValue;
      })
      .filter((r) => {
        if (!needle) return true;
        return normalize(r.fullName || "").includes(needle);
      });

    const byPatientId = new Map<string, WardAdmissionRow>();
    for (const r of filtered) {
      const pid = String(r.patientId || "").trim();
      if (!pid) continue;
      const prev = byPatientId.get(pid);
      if (!prev) {
        byPatientId.set(pid, r);
        continue;
      }
      const prevAt = new Date(prev.admittedAt as any).getTime();
      const nextAt = new Date(r.admittedAt as any).getTime();
      if (Number.isFinite(nextAt) && (!Number.isFinite(prevAt) || nextAt > prevAt)) {
        byPatientId.set(pid, r);
      }
    }

    const unique = Array.from(byPatientId.values()).sort((a, b) => {
      const da = new Date(a.admittedAt as any).getTime();
      const db = new Date(b.admittedAt as any).getTime();
      return db - da;
    });

    return unique.map((r) => {
        const admittedAt = new Date(r.admittedAt as any);
        const dischargedAt = r.dischargedAt ? new Date(r.dischargedAt as any) : null;
        const end = r.status === "discharged" && dischargedAt ? dischargedAt : new Date();
        const days = Math.max(0, Math.ceil((end.getTime() - admittedAt.getTime()) / (1000 * 60 * 60 * 24)));
        return {
          raw: r,
          admittedAtLabel: Number.isFinite(admittedAt.getTime()) ? admittedAt.toLocaleDateString() : "-",
          days,
        };
      });
  }, [q.data, search, effectivePeriodValue, period]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<WardAdmissionRow | null>(null);

  const openPrescribe = (r: WardAdmissionRow) => {
    setSelected(r);
    setOpen(true);
  };

  const titleUnit =
    wardUnit === "all" ? "All Wards" : wardUnitLabel[wardUnit] || wardUnit;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ward Patients ({titleUnit})</CardTitle>
          <Badge variant="outline">{rows.length}</Badge>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="min-w-full border-t border-gray-200">
              <thead className="bg-[#56bbe3] text-white">
                <tr>
                  <th className="px-4 py-3 text-left whitespace-nowrap">S/N</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Admitted</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Ward</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Card No</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Patient</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Sex</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Age</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Days</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Medications</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {q.isLoading && (
                  <tr>
                    <td colSpan={12} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      Loading ward patients...
                    </td>
                  </tr>
                )}
                {q.isError && !q.isLoading && (
                  <tr>
                    <td colSpan={12} className="px-4 py-10 text-center text-sm text-red-600">
                      Failed to load ward patients.
                    </td>
                  </tr>
                )}
                {!q.isLoading &&
                  !q.isError &&
                  rows.map((r, idx) => (
                    <tr key={r.raw._id} className="border-b border-gray-200 even:bg-[#f9f9f9]">
                      <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{r.admittedAtLabel}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="outline">{r.raw.wardUnit}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{r.raw.cardNumber || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{r.raw.fullName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{r.raw.phone || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{r.raw.sex || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{r.raw.age ?? "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{r.days}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.raw.status === "admitted" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Admitted</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Discharged</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {Array.isArray(r.raw.medicationOrders) ? r.raw.medicationOrders.length : 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={r.raw.status !== "admitted"}
                          onClick={() => openPrescribe(r.raw)}
                        >
                          Prescribe
                        </Button>
                      </td>
                    </tr>
                  ))}
                {!q.isLoading && !q.isError && rows.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No ward patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <PrescribeMoreDrugsModal
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setSelected(null);
        }}
        admission={selected}
      />
    </>
  );
}
