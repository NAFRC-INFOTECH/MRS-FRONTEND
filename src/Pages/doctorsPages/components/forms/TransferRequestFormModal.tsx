import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPatientByIdApi, type Patient } from "@/api-integration/queries/patients";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateLabReferralMutation } from "@/api-integration/mutations/labReferrals";
import { useCreateXrayReferralMutation } from "@/api-integration/mutations/xrayReferrals";
import { useCancelInvoiceMutation, useCreateInvoiceMutation, useUpdateInvoiceItemsMutation } from "@/api-integration/mutations/invoices";
import { usePriceItemsQuery } from "@/api-integration/queries/priceList";
import { getInvoiceByIdApi, useInvoicesByPatientIdQuery, type Invoice, type InvoiceItem } from "@/api-integration/queries/invoices";
import MultiSelectLabTests from "../multiSelect/MultiSelectLabTests";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function TransferRequestFormModal({
  open,
  onOpenChange,
  patientId,
  destination,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  patientId: string | null;
  destination: "lab" | "xray" | "nhia" | "paypoint" | null;
  onSubmitted: (dest: "lab" | "xray" | "nhia" | "paypoint") => void;
}) {
  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientByIdApi(patientId || ""),
    enabled: !!patientId && open,
  });
  const createReferral = useCreateLabReferralMutation();
  const createXrayReferral = useCreateXrayReferralMutation();
  const createInvoice = useCreateInvoiceMutation();
  const updateInvoiceItems = useUpdateInvoiceItemsMutation();
  const cancelInvoice = useCancelInvoiceMutation();
  const invoicesQuery = useInvoicesByPatientIdQuery(open ? patientId || undefined : undefined);

  const { data: testPriceItems = [] } = usePriceItemsQuery({ category: "test", activeOnly: true });
  const { data: scanPriceItems = [] } = usePriceItemsQuery({ category: "scan", activeOnly: true });

  const testItemById = useMemo(() => {
    const m = new Map<string, any>();
    for (const it of testPriceItems as any[]) m.set(String(it._id), it);
    return m;
  }, [testPriceItems]);

  const scanItemById = useMemo(() => {
    const m = new Map<string, any>();
    for (const it of scanPriceItems as any[]) m.set(String(it._id), it);
    return m;
  }, [scanPriceItems]);

  const computeAgeFromDob = (dob?: string) => {
    if (!dob) return "";
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return String(age);
  };

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    serviceNoOrUUID: "",
    rank: "",
    forenames: "",
    surname: "",
    wardNo: "",
    hospitalUnit: "",
    age: "",
    to: "",
    specimen: "",
    examinationRequired: "",
    diagnosis: "",
    statement: "",
    previousReportNos: "",
    previousReportDate: "",
  });

  const [selectedExams, setSelectedExams] = useState<{ id: string; name: string }[]>([]);
  const [billingRoute, setBillingRoute] = useState<"nhia" | "paypoint">("paypoint");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const patientIsPersonnel = !!(patient as any)?.veteran;
  const patientHasNHIAAccess = String((patient as any)?.nhiaStatus || "").trim().toLowerCase() === "cleared";
  const canUseNHIA = patientIsPersonnel || patientHasNHIAAccess;

  const isInvoiceCleared = (inv?: Invoice | null) => {
    if (!inv) return false;
    const route = String(inv.billingRoute || "").toLowerCase();
    if (route === "paypoint") return String(inv.paymentStatus || "") === "paid";
    if (route === "nhia") return String(inv.nhiaStampStatus || "") === "stamped";
    return false;
  };

  const isInvoicePendingClearance = (inv?: Invoice | null) => {
    if (!inv) return false;
    if (String(inv.paymentStatus || "") === "canceled") return false;
    return !isInvoiceCleared(inv);
  };

  const invoiceMatchesCategory = (inv?: Invoice | null, category?: "test" | "scan") => {
    const items = Array.isArray(inv?.items) ? inv?.items : [];
    return items.some((it) => String(it?.category || "").trim().toLowerCase() === category);
  };

  const pendingInvoiceForDestination = useMemo(() => {
    if (!destination) return null;
    if (destination !== "lab" && destination !== "xray") return null;
    const category = destination === "lab" ? "test" : "scan";
    const list = Array.isArray(invoicesQuery.data) ? invoicesQuery.data : [];
    const sorted = [...list].sort((a, b) => {
      const da = new Date((a as any).createdAt || 0).getTime();
      const db = new Date((b as any).createdAt || 0).getTime();
      return db - da;
    });
    return sorted.find((inv) => invoiceMatchesCategory(inv, category) && isInvoicePendingClearance(inv)) || null;
  }, [destination, invoicesQuery.data]);

  const invoiceQuery = useQuery({
    queryKey: ["invoices", "detail", invoiceId || "none"],
    queryFn: () => getInvoiceByIdApi(invoiceId || ""),
    enabled: !!invoiceId && open,
  });

  const activeInvoice = (invoiceQuery.data as Invoice | undefined) || pendingInvoiceForDestination || null;
  const activeInvoiceRoute = useMemo(() => {
    const route = String(activeInvoice?.billingRoute || "").trim().toLowerCase();
    return route === "nhia" ? "nhia" : route === "paypoint" ? "paypoint" : null;
  }, [activeInvoice]);

  const buildInvoiceItems = (): InvoiceItem[] => {
    const isLab = destination === "lab";
    const category = isLab ? "test" : "scan";
    const byId = isLab ? testItemById : scanItemById;
    return selectedExams.map((sel) => {
      const p = byId.get(sel.id);
      const name = String(p?.name || sel.name);
      const unit = String(p?.unit || "");
      const unitPrice = Number(p?.price ?? p?.cost ?? p?.sellingPrice ?? 0) || 0;
      return {
        priceItemId: String(sel.id || "").startsWith("custom:") ? undefined : sel.id,
        category,
        unit,
        name,
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice,
      };
    });
  };

  useEffect(() => {
    if (patient) {
      const p = patient as Patient;
      const nhiaStatus = String((p as any).nhiaStatus || "").trim().toLowerCase();
      const isPersonnel = !!(p as any).veteran;
      setBillingRoute(isPersonnel || nhiaStatus === "cleared" ? "nhia" : "paypoint");
      let toDest = "";
      if (destination === "lab") toDest = "Lab";
      else if (destination === "xray") toDest = "Radiology";
      else if (destination === "nhia") toDest = "NHIA";
      else if (destination === "paypoint") toDest = "Paypoint";
      setForm((prev) => ({
        ...prev,
        serviceNoOrUUID: p.serviceNumber || p.membershipNumber || p._id,
        rank: p.rank || "",
        forenames: [p.firstname, p.middlename].filter(Boolean).join(" "),
        surname: p.surname || "",
        age: p.age ? String(p.age) : computeAgeFromDob(p.dateOfBirth),
        to: toDest || prev.to,
      }));
    }
  }, [patient, destination]);

  useEffect(() => {
    setSelectedExams([]);
    setForm((prev) => ({ ...prev, examinationRequired: "" }));
    setInvoiceId(null);
  }, [destination, open]);

  useEffect(() => {
    if (!open) return;
    if (!activeInvoiceRoute) return;
    setBillingRoute(activeInvoiceRoute);
  }, [open, activeInvoiceRoute]);

  const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onGenerateInvoice = async () => {
    if (!patientId) return;
    if (destination !== "lab" && destination !== "xray") return;
    if (pendingInvoiceForDestination?._id) {
      setInvoiceId(pendingInvoiceForDestination._id);
      toast.info("Existing invoice is awaiting clearance. Update or cancel it.");
      return;
    }
    if (!selectedExams.length) {
      toast.error("Select at least one examination");
      return;
    }
    const items = buildInvoiceItems();
    try {
      const inv = await createInvoice.mutateAsync({ patientId, items, preferredBillingRoute: billingRoute });
      setInvoiceId(inv._id);
      toast.success("Invoice generated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      toast.error(msg || "Failed to create invoice");
    }
  };

  const onUpdateInvoice = async () => {
    if (!patientId) return;
    if (destination !== "lab" && destination !== "xray") return;
    const id = invoiceId || pendingInvoiceForDestination?._id || null;
    if (!id) return;
    if (!isInvoicePendingClearance(activeInvoice || null)) {
      toast.error("Invoice is already cleared");
      return;
    }
    if (!selectedExams.length) {
      toast.error("Select at least one examination");
      return;
    }
    const items = buildInvoiceItems();
    try {
      const updated = await updateInvoiceItems.mutateAsync({ invoiceId: id, items });
      setInvoiceId(updated._id);
      toast.success("Invoice updated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      toast.error(msg || "Failed to update invoice");
    }
  };

  const onCancelInvoice = async () => {
    const id = invoiceId || pendingInvoiceForDestination?._id || null;
    if (!id) return;
    try {
      await cancelInvoice.mutateAsync(id);
      toast.success("Invoice canceled");
      setInvoiceId(null);
      invoicesQuery.refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      toast.error(msg || "Failed to cancel invoice");
    }
  };

  const onSubmit = async () => {
    if (!destination) return;
    if (!patientId) return;

    const needsInvoice = destination === "lab" || destination === "xray";
    let invoiceId: string | undefined;

    if (needsInvoice) {
      const invToUse = invoiceId || pendingInvoiceForDestination?._id || null;
      if (!invToUse) {
        toast.error("Generate invoice first");
        return;
      }
      if (!isInvoiceCleared(activeInvoice || null)) {
        toast.error("Patient is not cleared yet");
        return;
      }
      invoiceId = invToUse;
    }

    if (destination === "lab") {
      await createReferral.mutateAsync({
        patientId,
        invoiceId,
        date: form.date,
        serviceNoOrUUID: form.serviceNoOrUUID,
        rank: form.rank,
        forenames: form.forenames,
        surname: form.surname,
        wardNo: form.wardNo,
        hospitalUnit: form.hospitalUnit,
        age: form.age,
        to: form.to,
        specimen: form.specimen,
        examinationRequired: form.examinationRequired,
        diagnosis: form.diagnosis,
        statement: form.statement,
        previousReportNos: form.previousReportNos,
        previousReportDate: form.previousReportDate,
      }).catch(() => void 0);
    }
    if (destination === "xray") {
      await createXrayReferral.mutateAsync({
        patientId,
        invoiceId,
        date: form.date,
        serviceNoOrUUID: form.serviceNoOrUUID,
        rank: form.rank,
        forenames: form.forenames,
        surname: form.surname,
        wardNo: form.wardNo,
        hospitalUnit: form.hospitalUnit,
        age: form.age,
        to: form.to,
        imagingArea: form.specimen,
        examinationRequired: form.examinationRequired,
        diagnosis: form.diagnosis,
        statement: form.statement,
        previousReportNos: form.previousReportNos,
        previousReportDate: form.previousReportDate,
      }).catch(() => void 0);
    }
    onOpenChange(false);
    onSubmitted(destination);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-2xl xl:max-w-4xl max-h-[80vh] overflow-auto mt-15 bg-white lg:ml-20 xl:ml-0">
        <DialogHeader className="text-3xl">
          <DialogTitle>{destination === "lab" ? "Laboratory Request Form" : "X-ray Request Form"}</DialogTitle>
          <DialogDescription>Fill out the request details. Prefilled fields come from the patient profile.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {isLoading && <div className="text-sm text-gray-500">Loading patient details…</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Date</label>
              <Input type="date" value={form.date} onChange={onChange("date")} />
            </div>
            {(destination === "lab" || destination === "xray") && (
              <div>
                <label className="text-xs text-gray-600">Billing Route</label>
                <Select
                  value={billingRoute}
                  onValueChange={(v) => setBillingRoute(v as "nhia" | "paypoint")}
                  disabled={!!activeInvoiceRoute}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nhia" disabled={!canUseNHIA}>NHIA</SelectItem>
                    <SelectItem value="paypoint">Paypoint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Service No / UUID</label>
              <Input value={form.serviceNoOrUUID} onChange={onChange("serviceNoOrUUID")} />
            </div>
          </div>

          {(destination === "lab" || destination === "xray") && pendingInvoiceForDestination?._id && (
            <div className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div className="space-y-1">
                <div className="text-xs text-gray-600">Existing Invoice Awaiting Clearance</div>
                <div className="flex items-center gap-2">
                  {String(pendingInvoiceForDestination.billingRoute || "").toLowerCase() === "nhia" ? (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">NHIA</Badge>
                  ) : (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Paypoint</Badge>
                  )}
                  {isInvoiceCleared(pendingInvoiceForDestination) ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Cleared</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Awaiting Clearance</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Invoice ID: {pendingInvoiceForDestination._id}</div>
              </div>
              <Button variant="outline" disabled={cancelInvoice.isPending || !isInvoicePendingClearance(pendingInvoiceForDestination)} onClick={onCancelInvoice}>
                Cancel Invoice
              </Button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Rank / Rating</label>
              <Input value={form.rank} onChange={onChange("rank")} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Forename(s)</label>
              <Input value={form.forenames} onChange={onChange("forenames")} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Surname</label>
              <Input value={form.surname} onChange={onChange("surname")} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Ward No (if admitted)</label>
              <Input value={form.wardNo} onChange={onChange("wardNo")} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Hospital / Ship Unit</label>
              <Input value={form.hospitalUnit} onChange={onChange("hospitalUnit")} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Age</label>
              <Input value={form.age} onChange={onChange("age")} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">To</label>
              <Input value={form.to} onChange={onChange("to")} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">{destination === "lab" ? "Laboratory Specimen" : "Imaging Area"}</label>
              <Input value={form.specimen} onChange={onChange("specimen")} />
            </div>
          </div>
          
          {destination === "lab" ? (
            <div>
              <label className="text-xs text-gray-600">Examination Required</label>
              <div className="mt-1">
                <MultiSelectLabTests
                  category="test"
                  onChange={(selected) => {
                    setSelectedExams(selected);
                    setForm((prev) => ({
                      ...prev,
                      examinationRequired: selected.map((test) => test.name).join(", "),
                    }));
                  }}
                />
              </div>
            </div>
          ) : destination === "xray" ? (
            <div>
              <label className="text-xs text-gray-600">Examination Required</label>
              <div className="mt-1">
                <MultiSelectLabTests
                  category="scan"
                  buttonLabel="Search or select scan"
                  searchPlaceholder="Search or add scan..."
                  addLabel="Add scan"
                  onChange={(selected) => {
                    setSelectedExams(selected);
                    setForm((prev) => ({
                      ...prev,
                      examinationRequired: selected.map((test) => test.name).join(", "),
                    }));
                  }}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs text-gray-600">Examination Required</label>
              <Input value={form.examinationRequired} onChange={onChange("examinationRequired")} />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-600">Diagnosis</label>
            <Input value={form.diagnosis} onChange={onChange("diagnosis")} />
          </div>
          <div>
            <label className="text-xs text-gray-600">Short Statement (Case Inc.)</label>
            <Textarea rows={3} value={form.statement} onChange={onChange("statement")} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Previous Report Nos</label>
              <Input value={form.previousReportNos} onChange={onChange("previousReportNos")} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Previous Report Date</label>
              <Input type="date" value={form.previousReportDate} onChange={onChange("previousReportDate")} />
            </div>
          </div>

          {/* <MultiSelectLabTests onChange={onChange("labTests")} /> */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {(destination === "lab" || destination === "xray") ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (invoiceId) invoiceQuery.refetch();
                  invoicesQuery.refetch();
                }}
                disabled={invoiceQuery.isFetching || invoicesQuery.isFetching}
              >
                Refresh
              </Button>
              <Button variant="outline" onClick={onGenerateInvoice} disabled={createInvoice.isPending || !!pendingInvoiceForDestination?._id || !!invoiceId}>
                Generate Invoice
              </Button>
              <Button variant="outline" onClick={onUpdateInvoice} disabled={updateInvoiceItems.isPending || !(invoiceId || pendingInvoiceForDestination?._id) || !isInvoicePendingClearance(activeInvoice || null)}>
                Update Invoice
              </Button>
              <Button variant="outline" onClick={onCancelInvoice} disabled={cancelInvoice.isPending || !(invoiceId || pendingInvoiceForDestination?._id) || !isInvoicePendingClearance(activeInvoice || null)}>
                Cancel Invoice
              </Button>
              <Button onClick={onSubmit} className="bg-[#56bbe3] text-white" disabled={!(invoiceId || pendingInvoiceForDestination?._id) || !isInvoiceCleared(activeInvoice || null)}>
                Submit Request
              </Button>
            </div>
          ) : (
            <Button onClick={onSubmit} className="bg-[#56bbe3] text-white">Submit Request</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
