import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getPatientByIdApi, type Patient } from "@/api-integration/queries/patients";
import { usePriceItemsQuery } from "@/api-integration/queries/priceList";
import { getInvoiceByIdApi, useInvoicesByPatientIdQuery, type Invoice, type InvoiceItem } from "@/api-integration/queries/invoices";
import { useCancelInvoiceMutation, useCreateInvoiceMutation, useUpdateInvoiceItemsMutation } from "@/api-integration/mutations/invoices";
import { useCreateXrayReferralMutation } from "@/api-integration/mutations/xrayReferrals";
import MultiSelectLabTests from "@/Pages/doctorsPages/components/multiSelect/MultiSelectLabTests";

export default function EyeRadiologyReferralModal({
  open,
  onOpenChange,
  patientId,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  patientId: string | null;
  onSubmitted?: () => void;
}) {
  const { data: patient, isLoading: isPatientLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientByIdApi(patientId || ""),
    enabled: !!patientId && open,
  });

  const createInvoice = useCreateInvoiceMutation();
  const updateInvoiceItems = useUpdateInvoiceItemsMutation();
  const cancelInvoice = useCancelInvoiceMutation();
  const createXrayReferral = useCreateXrayReferralMutation();

  const invoicesQuery = useInvoicesByPatientIdQuery(open ? patientId || undefined : undefined);

  const { data: scanPriceItems = [] } = usePriceItemsQuery({ category: "scan", activeOnly: true });
  const scanItemById = useMemo(() => {
    const m = new Map<string, any>();
    for (const it of scanPriceItems as any[]) m.set(String(it._id), it);
    return m;
  }, [scanPriceItems]);

  const [billingRoute, setBillingRoute] = useState<"nhia" | "paypoint">("paypoint");
  const patientIsPersonnel = !!(patient as any)?.veteran;
  const patientHasNHIAAccess = String((patient as any)?.nhiaStatus || "").trim().toLowerCase() === "cleared";
  const canUseNHIA = patientIsPersonnel || patientHasNHIAAccess;

  const [selectedScans, setSelectedScans] = useState<{ id: string; name: string }[]>([]);
  const [imagingArea, setImagingArea] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [statement, setStatement] = useState("");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  const invoiceQuery = useQuery({
    queryKey: ["invoices", "detail", invoiceId || "none"],
    queryFn: () => getInvoiceByIdApi(invoiceId || ""),
    enabled: !!invoiceId && open,
  });

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

  const hasScanItems = (inv?: Invoice | null) => {
    const items = Array.isArray(inv?.items) ? inv?.items : [];
    return items.some((it) => String(it?.category || "").trim().toLowerCase() === "scan");
  };

  const pendingScanInvoice = useMemo(() => {
    const list = Array.isArray(invoicesQuery.data) ? invoicesQuery.data : [];
    const sorted = [...list].sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return db - da;
    });
    return sorted.find((inv) => hasScanItems(inv) && isInvoicePendingClearance(inv)) || null;
  }, [invoicesQuery.data]);

  const renderRouteBadge = (inv?: Invoice | null) => {
    const route = String(inv?.billingRoute || "").toLowerCase();
    if (route === "nhia") return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">NHIA</Badge>;
    if (route === "paypoint") return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Paypoint</Badge>;
    return <Badge variant="outline">-</Badge>;
  };

  const renderClearanceBadge = (inv?: Invoice | null) => {
    if (!inv) return <Badge variant="outline">No Invoice</Badge>;
    if (isInvoiceCleared(inv)) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Cleared</Badge>;
    const route = String(inv.billingRoute || "").toLowerCase();
    if (route === "paypoint") return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Awaiting Payment</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Awaiting NHIA Stamp</Badge>;
  };

  const currentInvoice = invoiceQuery.data as Invoice | undefined;
  const activeInvoice = currentInvoice || pendingScanInvoice || null;

  const activeInvoiceRoute = useMemo(() => {
    const route = String(activeInvoice?.billingRoute || "").trim().toLowerCase();
    return route === "nhia" ? "nhia" : route === "paypoint" ? "paypoint" : null;
  }, [activeInvoice]);

  useEffect(() => {
    if (!open) return;
    if (!activeInvoiceRoute) return;
    setBillingRoute(activeInvoiceRoute);
  }, [open, activeInvoiceRoute]);

  const resetState = () => {
    setSelectedScans([]);
    setImagingArea("");
    setDiagnosis("");
    setStatement("");
    setInvoiceId(null);
    const p = patient as Patient | undefined;
    const nhiaStatus = String((p as any)?.nhiaStatus || "").trim().toLowerCase();
    const isPersonnel = !!(p as any)?.veteran;
    setBillingRoute(isPersonnel || nhiaStatus === "cleared" ? "nhia" : "paypoint");
  };

  const buildInvoiceItems = (): InvoiceItem[] => {
    return selectedScans.map((sel) => {
      const p = scanItemById.get(sel.id);
      const name = String(p?.name || sel.name);
      const unit = String(p?.unit || "");
      const unitPrice = Number(p?.price ?? 0) || 0;
      return {
        priceItemId: String(sel.id || "").startsWith("custom:") ? undefined : sel.id,
        category: "scan",
        unit,
        name,
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice,
      };
    });
  };

  const onGenerateInvoice = async () => {
    if (!patientId) return;
    if (pendingScanInvoice?._id) {
      setInvoiceId(pendingScanInvoice._id);
      toast.info("Existing invoice is awaiting clearance. Update or cancel it.");
      return;
    }
    if (!selectedScans.length) {
      toast.error("Select at least one scan");
      return;
    }
    const items = buildInvoiceItems();
    try {
      const inv = await createInvoice.mutateAsync({ patientId, items, preferredBillingRoute: billingRoute });
      setInvoiceId(inv._id);
      toast.success("Invoice generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate invoice");
    }
  };

  const onUpdateInvoice = async () => {
    const id = invoiceId || pendingScanInvoice?._id || null;
    if (!id) return;
    const inv = activeInvoice;
    if (!inv || !isInvoicePendingClearance(inv)) {
      toast.error("Invoice is already cleared");
      return;
    }
    if (!selectedScans.length) {
      toast.error("Select at least one scan");
      return;
    }
    try {
      const updated = await updateInvoiceItems.mutateAsync({ invoiceId: id, items: buildInvoiceItems() });
      setInvoiceId(updated._id);
      toast.success("Invoice updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update invoice");
    }
  };

  const onCancelInvoice = async () => {
    const id = invoiceId || pendingScanInvoice?._id || null;
    if (!id) return;
    try {
      await cancelInvoice.mutateAsync(id);
      toast.success("Invoice canceled");
      setInvoiceId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel invoice");
    }
  };

  const onRefer = async () => {
    if (!patientId) return;
    const id = invoiceId || pendingScanInvoice?._id || null;
    if (!id) {
      toast.error("Generate invoice first");
      return;
    }
    if (!isInvoiceCleared(activeInvoice || null)) {
      toast.error("Patient is not cleared yet");
      return;
    }
    if (!selectedScans.length) {
      toast.error("Select at least one scan");
      return;
    }
    const p = patient as Patient | undefined;
    const serviceNoOrUUID = (p?.serviceNumber || p?.membershipNumber || p?._id || patientId) as string;
    const payload = {
      patientId,
      invoiceId: id,
      date: new Date().toISOString().slice(0, 10),
      serviceNoOrUUID,
      rank: p?.rank || "",
      forenames: [p?.firstname, p?.middlename].filter(Boolean).join(" "),
      surname: p?.surname || "",
      age: p?.age ? String(p.age) : "",
      to: "Radiology",
      imagingArea,
      examinationRequired: selectedScans.map((t) => t.name).join(", "),
      diagnosis,
      statement,
    };
    try {
      await createXrayReferral.mutateAsync(payload as any);
      toast.success("Referred to Radiology");
      onOpenChange(false);
      resetState();
      onSubmitted?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to refer");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) resetState();
      }}
    >
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-auto bg-white">
        <DialogHeader>
          <DialogTitle>Radiology Referral (Scan)</DialogTitle>
          <DialogDescription>
            Generate an invoice and wait for clearance before referring to Radiology.
          </DialogDescription>
        </DialogHeader>

        {isPatientLoading && <div className="text-sm text-gray-500">Loading patient…</div>}

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            <div>
              <label className="text-xs text-gray-600">Imaging Area</label>
              <Input value={imagingArea} onChange={(e) => setImagingArea(e.target.value)} placeholder="e.g. Orbit / Skull / Chest" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600">Examination Required</label>
            <div className="mt-1">
              <MultiSelectLabTests
                category="scan"
                buttonLabel="Search or select scan"
                searchPlaceholder="Search or add scan..."
                addLabel="Add scan"
                onChange={(selected) => setSelectedScans(selected)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Diagnosis</label>
              <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Short Statement</label>
              <Input value={statement} onChange={(e) => setStatement(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-md border p-3">
            <div className="space-y-1">
              <div className="text-xs text-gray-600">Invoice Status</div>
              <div className="flex items-center gap-2">
                {renderRouteBadge(activeInvoice || null)}
                {renderClearanceBadge(activeInvoice || null)}
              </div>
              {(invoiceId || pendingScanInvoice?._id) && (
                <div className="text-xs text-muted-foreground">Invoice ID: {invoiceId || pendingScanInvoice?._id}</div>
              )}
            </div>
            <Button
              variant="outline"
              disabled={!(invoiceId || pendingScanInvoice?._id) || invoiceQuery.isFetching || invoicesQuery.isFetching}
              onClick={() => {
                if (invoiceId) invoiceQuery.refetch();
                invoicesQuery.refetch();
              }}
            >
              Refresh
            </Button>
          </div>
        </div>

        <DialogFooter className="grid grid-cols-3 md:grid-cols-5">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-sm">Close</Button>
          <Button
            variant="outline"
            disabled={createInvoice.isPending || !!pendingScanInvoice?._id || !!invoiceId}
            onClick={onGenerateInvoice}
            className="text-sm"
          >
            Generate Invoice
          </Button>
          <Button
            variant="outline"
            disabled={updateInvoiceItems.isPending || !(invoiceId || pendingScanInvoice?._id) || !isInvoicePendingClearance(activeInvoice || null)}
            onClick={onUpdateInvoice}
            className="text-sm"
          >
            Update Invoice
          </Button>
          <Button
            variant="outline"
            disabled={cancelInvoice.isPending || !(invoiceId || pendingScanInvoice?._id) || !isInvoicePendingClearance(activeInvoice || null)}
            onClick={onCancelInvoice}
            className="text-sm"
          >
            Cancel Invoice
          </Button>
          <Button
            className="bg-[#56bbe3] text-white hover:bg-[#56bbe3] text-sm"
            disabled={!(invoiceId || pendingScanInvoice?._id) || !isInvoiceCleared(activeInvoice || null) || createXrayReferral.isPending}
            onClick={onRefer}
          >
            Refer to Radiology
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
