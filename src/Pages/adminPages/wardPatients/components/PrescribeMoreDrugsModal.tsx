import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { usePriceItemsQuery } from "@/api-integration/queries/priceList";
import type { WardAdmissionRow, WardMedicationOrder } from "@/api-integration/queries/wards";
import { useUpdateWardMedicationOrdersMutation } from "@/api-integration/mutations/wards";

type LocalOrder = WardMedicationOrder & { key: string };

export default function PrescribeMoreDrugsModal({
  open,
  onOpenChange,
  admission,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  admission: WardAdmissionRow | null;
}) {
  const updateOrders = useUpdateWardMedicationOrdersMutation();
  const { data: drugPriceItems = [] } = usePriceItemsQuery({ category: "drug", activeOnly: true });

  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const [orders, setOrders] = useState<LocalOrder[]>([]);

  const activeAdmissionId = String(admission?._id || "");

  const existingKeys = useMemo(() => {
    const m = new Map<string, LocalOrder>();
    const list = (admission?.medicationOrders || []) as WardMedicationOrder[];
    for (const o of list) {
      const k = String(o.priceItemId || "").trim() || `${String(o.name || "").toLowerCase()}:${Math.random()}`;
      m.set(k, { ...o, key: k });
    }
    return Array.from(m.values());
  }, [admission]);

  useEffect(() => {
    if (!open) return;
    setOrders(existingKeys);
    setNote(String(admission?.pharmacyPrescription || ""));
    setSearch("");
  }, [open, existingKeys, admission]);

  const filteredDrugs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (drugPriceItems as any[]).map((it) => ({
      id: String(it?._id || ""),
      name: String(it?.name || ""),
      unit: String(it?.unit || ""),
    }));
    const base = q ? list.filter((d) => d.name.toLowerCase().includes(q)) : list;
    return base.slice(0, 30);
  }, [drugPriceItems, search]);

  const addDrug = (drug: { id: string; name: string }) => {
    const exists = orders.some((o) => String(o.priceItemId || "") === drug.id);
    if (exists) {
      toast.info("Drug already added");
      return;
    }
    const key = `${drug.id}:${Date.now()}`;
    setOrders((prev) => [
      ...prev,
      {
        key,
        priceItemId: drug.id,
        name: drug.name,
        quantity: 1,
        instructions: "",
        usage: "",
      },
    ]);
  };

  const removeOrder = (key: string) => {
    setOrders((prev) => prev.filter((o) => o.key !== key));
  };

  const updateOrder = (key: string, patch: Partial<WardMedicationOrder>) => {
    setOrders((prev) => prev.map((o) => (o.key === key ? { ...o, ...patch } : o)));
  };

  const onSave = async () => {
    if (!activeAdmissionId) return;
    const normalized = orders
      .map((o) => ({
        priceItemId: String(o.priceItemId || "").trim(),
        name: String(o.name || "").trim(),
        quantity: Number(o.quantity ?? 0) || 0,
        instructions: String(o.instructions || "").trim(),
        usage: String(o.usage || "").trim(),
      }))
      .filter((o) => !!o.priceItemId && !!o.name && o.quantity > 0);

    const byPriceItemId = new Map<string, WardMedicationOrder>();
    for (const o of normalized) {
      byPriceItemId.set(o.priceItemId, o);
    }
    const uniqueOrders = Array.from(byPriceItemId.values());

    if (uniqueOrders.length === 0) {
      toast.error("Add at least one drug");
      return;
    }

    try {
      await updateOrders.mutateAsync({
        admissionId: activeAdmissionId,
        pharmacyPrescription: note,
        medicationOrders: uniqueOrders,
      });
      toast.success("Medication orders updated");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update medications");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-auto bg-white">
        <DialogHeader>
          <DialogTitle>Prescribe More Drugs</DialogTitle>
          <DialogDescription>
            Update ward medication orders for this admission. Add, reduce, or remove drugs as needed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
          <div className="space-y-3">
            <div className="text-sm font-medium">Search Drugs</div>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search drug name..." />
            <div className="space-y-2 max-h-[52vh] overflow-auto rounded-md border p-2">
              {filteredDrugs.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className="w-full text-left rounded-md border px-3 py-2 hover:bg-muted flex items-center justify-between"
                  onClick={() => addDrug({ id: d.id, name: d.name })}
                >
                  <span className="text-sm">{d.name}</span>
                  <Badge variant="outline">Add</Badge>
                </button>
              ))}
              {filteredDrugs.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">No drugs found.</div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Prescription Note</div>
            <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional ward note / prescription..." />

            <div className="text-sm font-medium">Medication Orders</div>
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.key} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm">{o.name}</div>
                    <Button variant="outline" size="sm" onClick={() => removeOrder(o.key)}>
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Quantity</div>
                      <Input
                        type="number"
                        min={1}
                        value={String(o.quantity ?? 1)}
                        onChange={(e) => updateOrder(o.key, { quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-muted-foreground mb-1">Usage</div>
                      <Input value={o.usage} onChange={(e) => updateOrder(o.key, { usage: e.target.value })} placeholder="e.g. 1 tab bd" />
                    </div>
                    <div className="md:col-span-3">
                      <div className="text-xs text-muted-foreground mb-1">Instructions</div>
                      <Input value={o.instructions} onChange={(e) => updateOrder(o.key, { instructions: e.target.value })} placeholder="e.g. After meals" />
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <div className="py-6 text-center text-sm text-muted-foreground">No medication orders.</div>}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]"
            disabled={updateOrders.isPending || !admission}
            onClick={onSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
