import { useMemo, useState } from "react";
import { ArrowRightLeft, Stamp } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useInvoicesByPatientIdQuery, useInvoicesQuery, type Invoice } from "@/api-integration/queries/invoices";
import { useMarkInvoiceCopayPaidMutation, useStampInvoiceNHIAMutation } from "@/api-integration/mutations/invoices";
import { formatCurrency } from "@/Pages/adminPages/createPriceListsPage/components/priceListTypes";

export default function NHIAInvoicesList() {
  const params = useParams<{ patientId?: string }>();
  const patientId = params.patientId || "";
  const navigate = useNavigate();
  const stamp = useStampInvoiceNHIAMutation();
  const copayPaid = useMarkInvoiceCopayPaidMutation();
  const listQuery = useInvoicesQuery({ billingRoute: "nhia" as any });
  const patientQuery = useInvoicesByPatientIdQuery(patientId);
  const invoices = (patientId ? patientQuery.data : listQuery.data) || [];
  const isLoading = patientId ? patientQuery.isLoading : listQuery.isLoading;
  const isError = patientId ? patientQuery.isError : listQuery.isError;

  const [searchTerm, setSearchTerm] = useState("");

  const latestByPatient = useMemo(() => {
    const nhiaOnly = (invoices as any[]).filter((x) => String(x?.billingRoute || "") === "nhia");
    const sorted = [...nhiaOnly].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const byPatient = new Map<string, Invoice>();
    for (const inv of sorted) {
      const key = String(inv.patientId || "");
      if (!key) continue;
      if (!byPatient.has(key)) byPatient.set(key, inv);
    }
    return Array.from(byPatient.values());
  }, [invoices]);

  const filtered = useMemo(() => {
    const source = patientId ? (invoices as any[]) : (latestByPatient as any[]);
    return source.filter((inv) => {
      if (!searchTerm) return true;
      return `${inv.patientName} ${inv.patientCardNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [latestByPatient, invoices, searchTerm, patientId]);

  const getStampBadge = (inv: any) => {
    const stamped = String(inv.nhiaStampStatus || "") === "stamped";
    return stamped ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Stamped</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Awaiting Stamp</Badge>
    );
  };

  const getCopayBadge = (inv: any) => {
    const due = Number(inv.patientAmountDue ?? 0) || 0;
    if (due <= 0) return <Badge variant="outline">No Copay</Badge>;
    return String(inv.copayStatus || "") === "paid" ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Copay Paid</Badge>
    ) : (
      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Copay Awaiting</Badge>
    );
  };

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">NHIA Invoices</h1>
          <p className="text-sm text-muted-foreground">Stamp invoices and confirm copay where applicable.</p>
        </div>
        <Button variant="outline" onClick={() => navigate(patientId ? "/nhia/patients" : "/nhia")}>
          <ArrowRightLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="w-full md:w-[400px] flex flex-col items-start justify-center">
        <span className="mr-2">Search</span>
        <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by Card No/Service No..." />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Shows the most recent NHIA invoice per patient.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="min-w-full border-t border-gray-200">
              <thead className="bg-[#56bbe3] text-white">
                <tr>
                  <th className="px-4 py-3 text-left whitespace-nowrap">S/N</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Card No</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Patient</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Total</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Patient Due</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">NHIA Due</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Stamp</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Copay</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Loading invoices...
                    </td>
                  </tr>
                )}
                {isError && !isLoading && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-red-600">
                      Failed to load invoices.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  !isError &&
                  filtered.map((inv, idx) => (
                    <tr key={inv._id} className="border-b border-gray-200 even:bg-[#f9f9f9]">
                      <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{inv.patientCardNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{inv.patientName}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(inv.totalCost)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatCurrency((inv as any).patientAmountDue ?? 0)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatCurrency((inv as any).nhiaAmountDue ?? 0)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{getStampBadge(inv)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{getCopayBadge(inv)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await stamp.mutateAsync(inv._id);
                                toast.success("Invoice stamped");
                              } catch (err) {
                                const msg = err instanceof Error ? err.message : String(err ?? "");
                                toast.error(msg || "Failed to stamp invoice");
                              }
                            }}
                            disabled={stamp.isPending || String((inv as any).nhiaStampStatus || "") === "stamped"}
                            className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]"
                          >
                            <Stamp className="h-4 w-4 mr-2" />
                            Stamp
                          </Button>

                          {(Number((inv as any).patientAmountDue ?? 0) || 0) > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  await copayPaid.mutateAsync(inv._id);
                                  toast.success("Copay marked as paid");
                                } catch (err) {
                                  const msg = err instanceof Error ? err.message : String(err ?? "");
                                  toast.error(msg || "Failed to mark copay as paid");
                                }
                              }}
                              disabled={copayPaid.isPending || String((inv as any).copayStatus || "") === "paid"}
                            >
                              Mark Copay Paid
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                {!isLoading && !isError && filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
