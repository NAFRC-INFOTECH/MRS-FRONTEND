import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWardAdmissionsQuery } from "@/api-integration/queries/wards";
import { useAdministerWardMedicationMutation, useDischargeWardAdmissionMutation } from "@/api-integration/mutations/wards";

export default function WardPatientsTable({ wardUnit }: { wardUnit: string }) {
  const q = useWardAdmissionsQuery({ wardUnit, status: "admitted" });
  const discharge = useDischargeWardAdmissionMutation();
  const administer = useAdministerWardMedicationMutation();
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => (q.data || []) as any[], [q.data]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((x) => x + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const normalizeText = (value: string) => String(value || "").toLowerCase();

  const parseUsage = (raw: string) => {
    const text = normalizeText(raw);
    const dashMatch = text.match(/(\d+\s*(?:-\s*\d+)+)/);
    if (dashMatch?.[1]) {
      const parts = dashMatch[1]
        .split("-")
        .map((x) => Number(String(x).trim()))
        .filter((n) => Number.isFinite(n) && n >= 0);
      if (parts.length >= 1) return { dosesPerDay: parts.length, amounts: parts };
    }
    const once = /(?:once|one)\s*(?:a|per)?\s*day|1\s*(?:x|time)\s*(?:a|per)?\s*day/.test(text);
    if (once) return { dosesPerDay: 1, amounts: [1] };
    const twice = /(?:twice)\s*(?:a|per)?\s*day|2\s*(?:x|times?)\s*(?:a|per)?\s*day/.test(text);
    if (twice) return { dosesPerDay: 2, amounts: [1, 1] };
    const thrice = /(?:thrice|three)\s*(?:x|times?)?\s*(?:a|per)?\s*day|3\s*(?:x|times?)\s*(?:a|per)?\s*day/.test(text);
    if (thrice) return { dosesPerDay: 3, amounts: [1, 1, 1] };
    const four = /(?:four)\s*(?:x|times?)?\s*(?:a|per)?\s*day|4\s*(?:x|times?)\s*(?:a|per)?\s*day/.test(text);
    if (four) return { dosesPerDay: 4, amounts: [1, 1, 1, 1] };
    return null;
  };

  const buildScheduleTimes = (baseDate: Date, dosesPerDay: number) => {
    const start = new Date(baseDate);
    start.setHours(7, 0, 0, 0);
    const end = new Date(baseDate);
    end.setHours(20, 0, 0, 0);
    if (!Number.isFinite(dosesPerDay) || dosesPerDay <= 0) return [];
    if (dosesPerDay === 1) {
      const one = new Date(baseDate);
      one.setHours(8, 0, 0, 0);
      return [one];
    }
    const span = end.getTime() - start.getTime();
    const step = span / (dosesPerDay - 1);
    return Array.from({ length: dosesPerDay }).map((_, i) => {
      const t = new Date(start.getTime() + step * i);
      t.setSeconds(0, 0);
      return t;
    });
  };

  type ScheduleItem = {
    drugPriceItemId: string;
    drugName: string;
    instructions: string;
    scheduledAt: Date;
    amount: number;
    administered: boolean;
  };

  const computeMedicationState = (admission: any) => {
    const orders = Array.isArray(admission?.medicationOrders) ? admission.medicationOrders : [];
    const admin = Array.isArray(admission?.medicationAdministrations) ? admission.medicationAdministrations : [];
    const adminKey = new Set(
      admin
        .map((a: any) => {
          const pid = String(a?.drugPriceItemId || "");
          const ms = new Date(a?.scheduledAt as any).getTime();
          if (!pid || !Number.isFinite(ms)) return "";
          return `${pid}:${ms}`;
        })
        .filter(Boolean)
    );
    const now = new Date(Date.now() + tick * 0);
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const schedule: ScheduleItem[] = orders.flatMap((o: any) => {
      const parsed = parseUsage(String(o?.usage || o?.instructions || ""));
      if (!parsed) return [];
      const times = buildScheduleTimes(base, parsed.dosesPerDay);
      return times.map((scheduledAt, idx) => {
        const key = `${String(o?.priceItemId || "")}:${scheduledAt.getTime()}`;
        const administered = adminKey.has(key);
        const amount = parsed.amounts[idx] ?? parsed.amounts[0] ?? 1;
        return {
          drugPriceItemId: String(o?.priceItemId || ""),
          drugName: String(o?.name || ""),
          instructions: String(o?.instructions || ""),
          scheduledAt,
          amount,
          administered,
        } satisfies ScheduleItem;
      });
    }) as ScheduleItem[];
    const due: ScheduleItem[] = schedule.filter((x: ScheduleItem) => x.scheduledAt.getTime() <= now.getTime() && !x.administered);
    const next = schedule
      .filter((x: ScheduleItem) => x.scheduledAt.getTime() > now.getTime() && !x.administered)
      .sort((a: ScheduleItem, b: ScheduleItem) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0];
    return { ordersCount: orders.length, schedule, due, dueCount: due.length, nextDueAt: next?.scheduledAt || null };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Admitted Patients</CardTitle>
        <Badge variant="outline">{rows.length}</Badge>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="min-w-full border-t border-gray-200">
            <thead className="bg-[#56bbe3] text-white">
              <tr>
                <th className="px-4 py-3 text-left whitespace-nowrap">S/N</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Card No</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Patient</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Phone</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Sex</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Age</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Admitted At</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Medications</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {q.isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading ward patients...
                  </td>
                </tr>
              )}
              {q.isError && !q.isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-red-600">
                    Failed to load ward patients.
                  </td>
                </tr>
              )}
              {!q.isLoading &&
                !q.isError &&
                rows.map((r, idx) => (
                  (() => {
                    const meds = computeMedicationState(r);
                    return (
                  <tr key={r._id} className="border-b border-gray-200 even:bg-[#f9f9f9]">
                    <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.cardNumber || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{r.fullName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.phone || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.sex || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.age ?? "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.admittedAt ? new Date(r.admittedAt).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {meds.ordersCount <= 0 ? (
                        <Badge variant="outline">No Meds</Badge>
                      ) : meds.dueCount > 0 ? (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Due {meds.dueCount}</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">OK</Badge>
                      )}
                      {meds.nextDueAt && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Next: {meds.nextDueAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {meds.ordersCount > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelected(r);
                              setOpen(true);
                            }}
                          >
                            Meds
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={discharge.isPending}
                          onClick={async () => {
                            try {
                              await discharge.mutateAsync(String(r._id));
                              toast.success("Patient discharged");
                            } catch (err) {
                              const msg = err instanceof Error ? err.message : String(err ?? "");
                              toast.error(msg || "Failed to discharge");
                            }
                          }}
                        >
                          Discharge
                        </Button>
                      </div>
                    </td>
                  </tr>
                    );
                  })()
                ))}
              {!q.isLoading && !q.isError && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No admitted patients.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setSelected(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.fullName ? `${selected.fullName} Medications` : "Medications"}</DialogTitle>
          </DialogHeader>
          {selected ? (
            (() => {
              const meds = computeMedicationState(selected);
              const due = meds.due.sort((a: ScheduleItem, b: ScheduleItem) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
              const upcoming = meds.schedule
                .filter((x: ScheduleItem) => x.scheduledAt.getTime() > new Date().getTime() && !x.administered)
                .sort((a: ScheduleItem, b: ScheduleItem) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
                .slice(0, 12);
              return (
                <div className="space-y-4">
                  {String(selected?.pharmacyPrescription || "").trim() && (
                    <div className="rounded-xl border p-3 text-sm whitespace-pre-wrap">{String(selected.pharmacyPrescription || "")}</div>
                  )}
                  {due.length > 0 ? (
                    <div className="space-y-2">
                      <div className="font-semibold">Due Now</div>
                      <div className="space-y-2">
                        {due.map((d: ScheduleItem) => (
                          <div key={`${d.drugPriceItemId}:${d.scheduledAt.getTime()}`} className="rounded-xl border border-red-200 bg-red-50 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-medium truncate">{d.drugName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {d.scheduledAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Dose {d.amount}
                                </div>
                                {d.instructions && <div className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{d.instructions}</div>}
                              </div>
                              <Button
                                size="sm"
                                disabled={administer.isPending}
                                className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]"
                                onClick={async () => {
                                  try {
                                    await administer.mutateAsync({
                                      admissionId: String(selected._id),
                                      drugPriceItemId: d.drugPriceItemId,
                                      scheduledAt: d.scheduledAt.toISOString(),
                                    });
                                    toast.success("Medication administered");
                                  } catch (err) {
                                    const msg = err instanceof Error ? err.message : String(err ?? "");
                                    toast.error(msg || "Failed to mark administered");
                                  }
                                }}
                              >
                                Administered
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border p-3">
                      <div className="font-medium">No medications due right now.</div>
                      {meds.nextDueAt && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Next dose at {meds.nextDueAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
                        </div>
                      )}
                    </div>
                  )}

                  {upcoming.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-semibold">Upcoming</div>
                      <div className="space-y-2">
                        {upcoming.map((u: ScheduleItem) => (
                          <div key={`${u.drugPriceItemId}:${u.scheduledAt.getTime()}`} className="rounded-xl border p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-medium truncate">{u.drugName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {u.scheduledAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Dose {u.amount}
                                </div>
                              </div>
                              <Badge variant="outline">Pending</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
