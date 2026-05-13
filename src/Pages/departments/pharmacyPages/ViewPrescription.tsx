import { useParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getPatientByIdApi, getPharmacyReferredPatientsApi, type PharmacyPatient, type DrugItem } from "@/api-integration/queries/patients";
import { usePriceItemsQuery } from "@/api-integration/queries/priceList";
import { useInvoicesByPatientIdQuery } from "@/api-integration/queries/invoices";
import { useCreateInvoiceMutation } from "@/api-integration/mutations/invoices";
import { toast } from "sonner";

export default function ViewPrescription() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const createInvoice = useCreateInvoiceMutation();

  const { data: patient, isLoading: patientLoading, isError: patientError } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientByIdApi(patientId || ""),
    enabled: !!patientId,
  });

  const { data: pharmacyPatients, isLoading: pharmacyLoading } = useQuery({
    queryKey: ["patients", "pharmacy", ""],
    queryFn: () => getPharmacyReferredPatientsApi(),
  });

  const { data: priceItems } = usePriceItemsQuery({ category: "drug", activeOnly: true });

  const { data: invoices, isLoading: invoicesLoading } = useInvoicesByPatientIdQuery(patientId);

  const pharmacyPatient = pharmacyPatients?.find((p) => p._id === patientId) as PharmacyPatient | undefined;

  const getDrugPrice = (drugName: string): number => {
    const item = priceItems?.find((p) => p.name.toLowerCase() === drugName.toLowerCase());
    return item?.price || 0;
  };

  const handleSendInvoice = async () => {
    if (!pharmacyPatient?.drugs || !patientId) return;
    try {
      const drugsWithPrices = pharmacyPatient.drugs.map((drug) => {
        const unitPrice = getDrugPrice(drug.name);
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

  const getPaymentStatusBadge = (status: string) => {
    if (status === "paid") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
    }
    if (status === "canceled") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Canceled</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Awaiting Payment</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
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
            <Button onClick={handleSendInvoice} disabled={createInvoice.isPending}>
              <FileText className="w-4 h-4 mr-2" />
              Send Invoice to Paypoint
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {patientLoading && <p className="text-muted-foreground">Loading patient details...</p>}
          {patientError && <p className="text-red-600">Failed to load patient details.</p>}
          {patient && (
            <div className="space-y-2">
              <p><span className="font-medium">Patient ID:</span> {patient._id}</p>
              <p><span className="font-medium">Name:</span> {[patient.surname, patient.firstname, patient.middlename].filter(Boolean).join(" ")}</p>
              <p><span className="font-medium">Card Number:</span> {patient.serviceNumber || patient.membershipNumber || "-"}</p>
              <p><span className="font-medium">Phone:</span> {patient.phone || "-"}</p>
              <p><span className="font-medium">Rank:</span> {patient.rank || "-"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
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
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Drugs</CardTitle>
        </CardHeader>
        <CardContent>
          {pharmacyLoading ? (
            <p className="text-muted-foreground">Loading drugs...</p>
          ) : pharmacyPatient?.drugs && pharmacyPatient.drugs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Dosage</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Unit Price</th>
                    <th className="px-4 py-2 text-left">Total</th>
                    <th className="px-4 py-2 text-left">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {pharmacyPatient.drugs.map((drug: DrugItem, idx: number) => {
                    const unitPrice = getDrugPrice(drug.name);
                    const total = unitPrice * drug.quantity;
                    return (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="px-4 py-2">{drug.name}</td>
                        <td className="px-4 py-2">{drug.dosage}</td>
                        <td className="px-4 py-2">{drug.quantity}</td>
                        <td className="px-4 py-2">₵{unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-2">₵{total.toFixed(2)}</td>
                        <td className="px-4 py-2">{drug.instructions || "-"}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-medium">
                    <td colSpan={4} className="px-4 py-2 text-right">Total Cost:</td>
                    <td className="px-4 py-2">
                      ₵{pharmacyPatient.drugs.reduce((sum, drug) => sum + (getDrugPrice(drug.name) * drug.quantity), 0).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
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
        <CardContent>
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
                  <p><span className="font-medium">Date:</span> {new Date(invoice.createdAt).toLocaleString()}</p>
                  <p><span className="font-medium">Total Cost:</span> ₵{invoice.totalCost.toFixed(2)}</p>
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
                          <td className="px-3 py-1">₵{drug.unitPrice.toFixed(2)}</td>
                          <td className="px-3 py-1">₵{drug.totalPrice.toFixed(2)}</td>
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
