import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  usePharmacyReferredPatientsQuery,
  type PharmacyPatient,
  type DrugItem,
} from "@/api-integration/queries/patients";
import { usePriceItemsQuery } from "@/api-integration/queries/priceList";
import { useInvoicesByPatientIdQuery } from "@/api-integration/queries/invoices";
import { useCreateInvoiceMutation } from "@/api-integration/mutations/invoices";
import { useUpdatePharmacyDeskStateMutation } from "@/api-integration/mutations/patients";
import { useDispensePriceItemMutation } from "@/api-integration/mutations/priceList";
import { toast } from "sonner";
import { formatCurrency } from "@/Pages/adminPages/createPriceListsPage/components/priceListTypes";

export default function ViewPrescription() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const createInvoice = useCreateInvoiceMutation();
  const updatePharmacyDeskState = useUpdatePharmacyDeskStateMutation();
  const dispensePriceItem = useDispensePriceItemMutation();
  const [dispensingDrugKey, setDispensingDrugKey] = useState<string | null>(null);
  const [dispensingAll, setDispensingAll] = useState(false);

  const { data: pharmacyPatients, isLoading: pharmacyLoading, isError: pharmacyIsError, error: pharmacyError } =
    usePharmacyReferredPatientsQuery();

  const { data: priceItems } = usePriceItemsQuery({ category: "drug", activeOnly: true });

  const { data: invoices, isLoading: invoicesLoading } = useInvoicesByPatientIdQuery(patientId);

  const pharmacyPatient = pharmacyPatients?.find((p) => p._id === patientId) as PharmacyPatient | undefined;

  const normalizeInvoiceDrug = (d: any) => ({
    name: String(d?.name ?? "").trim().toLowerCase(),
    dosage: String(d?.dosage ?? "").trim().toLowerCase(),
    instructions: String(d?.instructions ?? "").trim().toLowerCase(),
    quantity: Number(d?.quantity ?? 0) || 0,
  });

  const hashDrugs = (drugs: any[] | undefined) => {
    if (!Array.isArray(drugs) || drugs.length === 0) return "";
    const normalized = drugs
      .map(normalizeInvoiceDrug)
      .sort((a, b) => {
        const ak = `${a.name}|${a.dosage}|${a.instructions}|${a.quantity}`;
        const bk = `${b.name}|${b.dosage}|${b.instructions}|${b.quantity}`;
        return ak.localeCompare(bk);
      });
    return JSON.stringify(normalized);
  };

  const currentPrescriptionHash = useMemo(() => hashDrugs((pharmacyPatient as any)?.drugs), [pharmacyPatient]);
  const latestInvoiceHash = useMemo(() => hashDrugs((invoices?.[0] as any)?.drugs), [invoices]);
  const invoiceAlreadySentForCurrentPrescription =
    !!currentPrescriptionHash && !!latestInvoiceHash && currentPrescriptionHash === latestInvoiceHash;

  const getPriceItem = (drug: DrugItem) => {
    if (drug.priceItemId) {
      const byId = priceItems?.find((item) => item._id === drug.priceItemId);
      if (byId) return byId;
    }
    return priceItems?.find((item) => item.name.toLowerCase() === drug.name.toLowerCase());
  };

  const getDrugPrice = (drug: DrugItem): number => {
    const item = getPriceItem(drug);
    return item?.price || 0;
  };

  const handleSendInvoice = async () => {
    if (!pharmacyPatient?.drugs || !patientId) return;
    if (invoicesLoading) return;
    if (invoiceAlreadySentForCurrentPrescription) {
      toast.error("Invoice already sent for this prescription");
      return;
    }
    try {
      const drugsWithPrices = pharmacyPatient.drugs.map((drug) => {
        const unitPrice = getDrugPrice(drug);
        return {
          ...drug,
          unitPrice,
          totalPrice: unitPrice * drug.quantity,
        };
      });
      await createInvoice.mutateAsync({ patientId, drugs: drugsWithPrices });
      toast.success("Invoice sent to paypoint");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      toast.error(msg || "Failed to send invoice");
    }
  };

  const handleDispenseDrug = async (drug: DrugItem, index: number) => {
    if (!patientId || !pharmacyPatient?.drugs) return;
    if (drug.dispensed) return;

    const priceItem = getPriceItem(drug);
    if (!priceItem) {
      toast.error(`No price-list item found for ${drug.name}`);
      return;
    }

    const drugKey = `${priceItem._id}:${index}`;
    setDispensingDrugKey(drugKey);

    try {
      const nextDrugs = pharmacyPatient.drugs.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              priceItemId: priceItem._id,
              dispensed: true,
            }
          : item
      );

      const nextDeskState = nextDrugs.every((item) => item.dispensed) ? "completed" : pharmacyPatient.deskState;

      await updatePharmacyDeskState.mutateAsync({
        patientId,
        deskState: nextDeskState,
        prescription: pharmacyPatient.prescription,
        drugs: nextDrugs,
      });

      await dispensePriceItem.mutateAsync({
        id: priceItem._id,
        quantity: drug.quantity,
      });

      toast.success(`${drug.name} marked as dispensed`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      toast.error(msg || "Failed to update dispensed drug");
    } finally {
      setDispensingDrugKey(null);
    }
  };

  const handleDispenseAll = async () => {
    if (!patientId || !pharmacyPatient?.drugs) return;
    const pending = pharmacyPatient.drugs
      .map((drug, idx) => ({ drug, idx }))
      .filter(({ drug }) => !drug.dispensed);
    if (pending.length === 0) {
      toast.info("All drugs are already dispensed");
      return;
    }

    const resolved = pending.map(({ drug, idx }) => ({ drug, idx, priceItem: getPriceItem(drug) }));
    const missing = resolved.find((x) => !x.priceItem);
    if (missing) {
      toast.error(`No price-list item found for ${missing.drug.name}`);
      return;
    }

    setDispensingAll(true);
    setDispensingDrugKey("ALL");
    try {
      const nextDrugs = pharmacyPatient.drugs.map((drug, idx) => {
        const match = resolved.find((x) => x.idx === idx);
        if (!match) return drug;
        return {
          ...drug,
          priceItemId: match.priceItem!._id,
          dispensed: true,
        };
      });

      await updatePharmacyDeskState.mutateAsync({
        patientId,
        deskState: "completed",
        prescription: pharmacyPatient.prescription,
        drugs: nextDrugs,
      });

      for (const item of resolved) {
        await dispensePriceItem.mutateAsync({
          id: item.priceItem!._id,
          quantity: item.drug.quantity,
        });
      }

      toast.success("All drugs marked as dispensed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      toast.error(msg || "Failed to dispense all drugs");
    } finally {
      setDispensingDrugKey(null);
      setDispensingAll(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === "paid") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
    }
    if (status === "canceled") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Canceled</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Awaiting Payment</Badge>;
  };

  const formatRelativeDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThatDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.floor((startOfToday.getTime() - startOfThatDay.getTime()) / (1000 * 60 * 60 * 24));

    const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    if (diffDays === 0) return `Today, ${time}`;
    if (diffDays === 1) return `Yesterday, ${time}`;
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "a week ago";
    if (diffDays < 30) return `${Math.round(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return "a month ago";
    if (diffDays < 365) return `${Math.round(diffDays / 30)} months ago`;
    if (diffDays < 730) return "a year ago";
    return `${Math.round(diffDays / 365)} years ago`;
  };

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate("/pharmacy/patientsList")}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">View Prescription</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Patient Details</CardTitle>
          {pharmacyPatient?.drugs && pharmacyPatient.drugs.length > 0 && (
            <Button
              onClick={handleSendInvoice}
              disabled={createInvoice.isPending || invoicesLoading || invoiceAlreadySentForCurrentPrescription}
            >
              <FileText className="w-4 h-4 mr-2" />
              Send Invoice to Paypoint
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {pharmacyLoading && <p className="text-muted-foreground">Loading patient details...</p>}
          {pharmacyIsError && (
            <div className="text-red-600">
              <p>Failed to load patient details.</p>
              <p className="text-sm mt-2">{(pharmacyError as Error)?.message || "Unknown error"}</p>
            </div>
          )}
          {!pharmacyLoading && !pharmacyIsError && !pharmacyPatient && (
            <p className="text-muted-foreground">Patient was not found in the pharmacy queue.</p>
          )}
          {pharmacyPatient && (
            <div className="space-y-2">
              {/* <p><span className="font-medium">Patient ID:</span> {pharmacyPatient._id}</p> */}
              <p><span className="font-medium">Name:</span> {[pharmacyPatient.surname, pharmacyPatient.firstname, pharmacyPatient.middlename].filter(Boolean).join(" ")}</p>
              <p><span className="font-medium">Card Number:</span> {pharmacyPatient.serviceNumber || pharmacyPatient.membershipNumber || "-"}</p>
              <p><span className="font-medium">Phone:</span> {pharmacyPatient.phone || "-"}</p>
              <p><span className="font-medium">Rank:</span> {pharmacyPatient.rank || "-"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Prescription</CardTitle>
        </CardHeader>
        <CardContent>
          {pharmacyLoading ? (
            <p className="text-muted-foreground">Loading prescription...</p>
          ) : pharmacyPatient?.prescription ? (
            <p>{pharmacyPatient.prescription}</p>
          ) : (
            <p className="text-muted-foreground">No prescription notes available.</p>
          )}
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Current Drugs</CardTitle>
          {pharmacyPatient?.drugs && pharmacyPatient.drugs.length > 0 && (
            <Button
              size="sm"
              onClick={handleDispenseAll}
              disabled={
                dispensingAll ||
                dispensePriceItem.isPending ||
                updatePharmacyDeskState.isPending ||
                pharmacyPatient.drugs.every((d) => d.dispensed)
              }
              className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]"
            >
              {dispensingAll ? "Dispensing..." : "Dispense All"}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {pharmacyLoading ? (
            <p className="text-muted-foreground">Loading drugs...</p>
          ) : pharmacyPatient?.drugs && pharmacyPatient.drugs.length > 0 ? (
            <div className="overflow-x-auto rounded-t-[8px] border border-gray-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-[#56bbe3] text-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Drug</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Prescription</th>
                    <th className="px-4 py-2 text-left">Dispense</th>
                  </tr>
                </thead>
                <tbody>
                  {pharmacyPatient.drugs.map((drug: DrugItem, idx: number) => {
                    const priceItem = getPriceItem(drug);
                    const drugKey = `${priceItem?._id || drug.name}:${idx}`;
                    return (
                      <tr key={idx} className="border-b border-gray-200 even:bg-[#f9f9f9]">
                        <td className="px-4 py-2">{drug.name}</td>
                        <td className="px-4 py-2">{drug.quantity}</td>
                        <td className="px-4 py-2">{drug.instructions || drug.dosage || "-"}</td>
                        <td className="px-4 py-2">
                          {drug.dispensed ? (
                            <div className="inline-flex items-center gap-2 text-green-700">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm">Dispensed</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              disabled={
                                dispensingDrugKey === drugKey ||
                                dispensingAll ||
                                dispensePriceItem.isPending ||
                                updatePharmacyDeskState.isPending
                              }
                              onClick={() => handleDispenseDrug(drug, idx)}
                              className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]"
                            >
                              {dispensingDrugKey === drugKey ? "Updating..." : "Mark Dispensed"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground">No drugs prescribed.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {invoicesLoading && <p className="text-muted-foreground">Loading invoice history...</p>}
          {!invoicesLoading && invoices?.length === 0 && (
            <p className="text-muted-foreground">No invoices yet.</p>
          )}
          {invoices?.map((invoice) => (
            <Card key={invoice._id} className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Invoice #{invoice._id.slice(-8)}</CardTitle>
                {getPaymentStatusBadge(invoice.paymentStatus)}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p><span className="font-medium">Date:</span> {formatRelativeDate(invoice.createdAt)}</p>
                  <p><span className="font-medium">Total Cost:</span> {formatCurrency(invoice.totalCost)}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-1 text-left">Name</th>
                        <th className="px-3 py-1 text-left">Dosage</th>
                        <th className="px-3 py-1 text-left">Qty</th>
                        <th className="px-3 py-1 text-left">Unit</th>
                        <th className="px-3 py-1 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.drugs.map((drug, idx) => (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className="px-3 py-1">{drug.name}</td>
                          <td className="px-3 py-1">{drug.dosage}</td>
                          <td className="px-3 py-1">{drug.quantity}</td>
                          <td className="px-3 py-1">{formatCurrency(drug.unitPrice)}</td>
                          <td className="px-3 py-1">{formatCurrency(drug.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
