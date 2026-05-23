import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEventsQuery } from "@/api-integration/queries/events";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AuditLog() {
  const [aggregateType, setAggregateType] = useState<string>("all");
  const [eventType, setEventType] = useState<string>("all");
  const [aggregateId, setAggregateId] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [limit, setLimit] = useState<number>(100);
  const [page, setPage] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const params = useMemo(() => {
    return {
      aggregateType: aggregateType === "all" ? undefined : aggregateType,
      eventType: eventType === "all" ? undefined : eventType,
      aggregateId: aggregateId.trim() ? aggregateId.trim() : undefined,
      from: from || undefined,
      to: to || undefined,
      limit,
      skip: page * limit,
    };
  }, [aggregateId, aggregateType, eventType, from, to, limit, page]);

  const q = useEventsQuery(params);
  const events = q.data ?? [];
  const canNext = events.length >= limit;

  const resetFilters = () => {
    setAggregateType("all");
    setEventType("all");
    setAggregateId("");
    setFrom("");
    setTo("");
    setLimit(100);
    setPage(0);
  };

  const fmt = (d: string) => {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleString();
  };

  const openDetails = (e: any) => {
    setSelected(e);
    setOpen(true);
  };

  const badgeForAggregate = (a?: string) => {
    const v = String(a || "").toLowerCase();
    if (v === "patient" || v === "pharmacypatient") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (v === "invoice") return "bg-indigo-100 text-indigo-800 border-indigo-200";
    if (v === "duty") return "bg-sky-100 text-sky-800 border-sky-200";
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  const badgeForEvent = (t?: string) => {
    const v = String(t || "").toLowerCase();
    if (v.includes("deleted")) return "bg-rose-100 text-rose-800 border-rose-200";
    if (v.includes("updated")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (v.includes("created")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  return (
    <div className="py-4 space-y-6">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <CardTitle>Audit Log</CardTitle>
              <p className="text-sm text-muted-foreground">Track key actions across duties, invoices, patients, and pharmacy updates.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" type="button" onClick={() => q.refetch()} disabled={q.isFetching}>
                {q.isFetching ? "Refreshing..." : "Refresh"}
              </Button>
              <Button variant="outline" type="button" onClick={resetFilters} disabled={q.isFetching}>
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-lg border bg-card p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="flex flex-col gap-1">
                <Label>Aggregate</Label>
                <Select value={aggregateType} onValueChange={(v) => { setAggregateType(v); setPage(0); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Duty">Duty</SelectItem>
                      <SelectItem value="Invoice">Invoice</SelectItem>
                      <SelectItem value="Patient">Patient</SelectItem>
                      <SelectItem value="PharmacyPatient">PharmacyPatient</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Event</Label>
                <Select value={eventType} onValueChange={(v) => { setEventType(v); setPage(0); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="DutyCreated">DutyCreated</SelectItem>
                      <SelectItem value="DutyUpdated">DutyUpdated</SelectItem>
                      <SelectItem value="DutyDeleted">DutyDeleted</SelectItem>
                      <SelectItem value="InvoiceCreated">InvoiceCreated</SelectItem>
                      <SelectItem value="InvoicePaymentStatusUpdated">InvoicePaymentStatusUpdated</SelectItem>
                      <SelectItem value="PatientCreated">PatientCreated</SelectItem>
                      <SelectItem value="PatientUpdated">PatientUpdated</SelectItem>
                      <SelectItem value="PatientDeleted">PatientDeleted</SelectItem>
                      <SelectItem value="PatientAddedToPharmacy">PatientAddedToPharmacy</SelectItem>
                      <SelectItem value="PharmacyDeskStateUpdated">PharmacyDeskStateUpdated</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <Label>Aggregate ID</Label>
                <Input
                  value={aggregateId}
                  onChange={(e) => { setAggregateId(e.target.value); setPage(0); }}
                  placeholder="Paste an ID to narrow down"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>From</Label>
                <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} />
              </div>

              <div className="flex flex-col gap-1">
                <Label>To</Label>
                <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows</span>
                  <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(0); }}>
                    <SelectTrigger className="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground">
                  Page <span className="text-foreground">{page + 1}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || q.isFetching}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]/70"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!canNext || q.isFetching}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#56bbe3] hover:bg-[#56bbe3]">
                  <TableHead className="text-white font-bold uppercase text-xs">Time</TableHead>
                  <TableHead className="text-white font-bold uppercase text-xs">Aggregate</TableHead>
                  <TableHead className="text-white font-bold uppercase text-xs">Aggregate ID</TableHead>
                  <TableHead className="text-white font-bold uppercase text-xs">Event</TableHead>
                  <TableHead className="text-white font-bold uppercase text-xs">Actor</TableHead>
                  <TableHead className="text-white font-bold uppercase text-xs text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Loading events...
                    </TableCell>
                  </TableRow>
                )}
                {q.isError && !q.isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-red-600">
                      Failed to load events
                    </TableCell>
                  </TableRow>
                )}
                {!q.isLoading && !q.isError && events.map((e) => (
                  <TableRow
                    key={e._id}
                    className="even:bg-muted/30 cursor-pointer"
                    onClick={() => openDetails(e)}
                  >
                    <TableCell className="whitespace-nowrap">{fmt(e.occurredAt)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline" className={badgeForAggregate(e.aggregateType)}>{e.aggregateType}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-xs">{e.aggregateId}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline" className={badgeForEvent(e.eventType)}>{e.eventType}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{String((e.meta as any)?.actorUserId || "-")}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openDetails(e);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!q.isLoading && !q.isError && events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No events found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription className="break-all">
              {selected ? `${selected.aggregateType} • ${selected.eventType} • ${selected.aggregateId}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Time</div>
                  <div className="text-sm font-medium">{fmt(selected.occurredAt)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Actor</div>
                  <div className="text-sm font-medium">{String((selected.meta as any)?.actorUserId || "-")}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Seq</div>
                  <div className="text-sm font-medium">{String(selected.seq ?? "-")}</div>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="text-xs text-muted-foreground mb-2">Payload</div>
                <pre className="text-xs whitespace-pre-wrap break-words font-mono leading-relaxed">
                  {JSON.stringify(selected.payload ?? {}, null, 2)}
                </pre>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="text-xs text-muted-foreground mb-2">Meta</div>
                <pre className="text-xs whitespace-pre-wrap break-words font-mono leading-relaxed">
                  {JSON.stringify(selected.meta ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
