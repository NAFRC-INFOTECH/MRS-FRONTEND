import { useMemo, useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAllInvoicesQuery,
  PAYMENT_STATUS,
  type Invoice,
} from "@/api-integration/queries/invoices";
import {
  useUpdateInvoicePaymentStatusMutation,
} from "@/api-integration/mutations/invoices";
import { formatCurrency } from "@/Pages/adminPages/createPriceListsPage/components/priceListTypes";

export default function PaypointPatientsList() {
  const navigate = useNavigate();
  const { data: allInvoices = [], isLoading: allInvoicesLoading } = useAllInvoicesQuery();
  const updateInvoiceStatus = useUpdateInvoicePaymentStatusMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const latestInvoices = useMemo(() => {
    const sorted = [...allInvoices].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const byPatient = new Map<string, Invoice>();
    for (const inv of sorted) {
      const key = String(inv.patientId || "");
      if (!key) continue;
      if (!byPatient.has(key)) byPatient.set(key, inv);
    }
    return Array.from(byPatient.values());
  }, [allInvoices]);

  const filteredInvoices = useMemo(() => {
    return latestInvoices.filter((invoice) => {
      const matchesSearch = searchTerm
        ? `${invoice.patientName} ${invoice.patientCardNumber}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;
      const matchesStatus = statusFilter === "all" ? true : invoice.paymentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [latestInvoices, searchTerm, statusFilter]);

  const getPaymentStatusBadge = (status: string) => {
    if (status === PAYMENT_STATUS.PAID) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
    }
    if (status === PAYMENT_STATUS.CANCELED) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Canceled</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Awaiting Payment</Badge>;
  };

  const markInvoicePaid = (invoiceId: string) => {
    updateInvoiceStatus.mutate(
      { invoiceId, paymentStatus: PAYMENT_STATUS.PAID },
      {
        onSuccess: () => toast.success("Invoice marked as paid"),
        onError: () => toast.error("Failed to mark invoice as paid"),
      }
    );
  };

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Paypoint Invoices List</h1>
          <p className="text-sm text-muted-foreground">
            Manage invoices and mark them as paid.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/paypoint")}>
          <ArrowRightLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <section className="space-y-6 lg:flex lg:gap-6 lg:justify-between">
        <div className="space-y-6 w-full">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Queue Controls</CardTitle>
              <CardDescription>
                Filter invoices by payment status or search by patient name / card number.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value={PAYMENT_STATUS.AWAITING}>Awaiting Payment</SelectItem>
                    <SelectItem value={PAYMENT_STATUS.PAID}>Paid</SelectItem>
                    <SelectItem value={PAYMENT_STATUS.CANCELED}>Canceled</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by patient name or card number"
                  className="lg:col-span-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoices Table</CardTitle>
              <CardDescription>
                Click an invoice to view details in the sidebar.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <table className="min-w-full border-t border-gray-200">
                  <thead className="bg-[#56bbe3] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">S/N</th>
                      <th className="px-4 py-3 text-left whitespace-nowrap">Card No</th>
                      <th className="px-4 py-3 text-left whitespace-nowrap">Patient Name</th>
                      <th className="px-4 py-3 text-left whitespace-nowrap">Total Cost</th>
                      <th className="px-4 py-3 text-left whitespace-nowrap">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allInvoicesLoading && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          Loading invoices...
                        </td>
                      </tr>
                    )}

                    {!allInvoicesLoading &&
                      filteredInvoices.map((invoice, idx) => (
                        <tr
                          key={invoice._id}
                          className={`border-b border-gray-200 even:bg-[#f9f9f9] cursor-pointer ${selectedInvoice?._id === invoice._id ? "bg-blue-50" : ""}`}
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{invoice.patientCardNumber}</td>
                          <td className="px-4 py-3 font-medium whitespace-nowrap">{invoice.patientName}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(invoice.totalCost)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{getPaymentStatusBadge(invoice.paymentStatus)}</td>
                        </tr>
                      ))}

                    {!allInvoicesLoading && filteredInvoices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center">
                          <div className="space-y-1">
                            <p className="font-medium">No invoices found.</p>
                            <p className="text-sm text-muted-foreground">
                              Invoices will appear here once they are created.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-[400px]">
          {selectedInvoice ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Card key={selectedInvoice._id} className="border border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div>
                        <CardTitle className="text-sm font-medium">
                          Invoice #{selectedInvoice._id.slice(-8)}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {new Date(selectedInvoice.createdAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      {getPaymentStatusBadge(selectedInvoice.paymentStatus)}
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 text-xs">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-2 py-1 text-left">Name</th>
                              <th className="px-2 py-1 text-left">Qty</th>
                              <th className="px-2 py-1 text-left">Unit</th>
                              <th className="px-2 py-1 text-left">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedInvoice.drugs.map((drug, idx) => (
                              <tr key={idx} className="border-b border-gray-200">
                                <td className="px-2 py-1">{drug.name}</td>
                                <td className="px-2 py-1">{drug.quantity}</td>
                                <td className="px-2 py-1">{formatCurrency(drug.unitPrice)}</td>
                                <td className="px-2 py-1">{formatCurrency(drug.totalPrice)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          Total: {formatCurrency(selectedInvoice.totalCost)}
                        </div>
                        {selectedInvoice.paymentStatus !== PAYMENT_STATUS.PAID && (
                          <Button
                            size="sm"
                            onClick={() => markInvoicePaid(selectedInvoice._id)}
                            disabled={updateInvoiceStatus.isPending}
                            className="bg-[#56bbe3] text-white"
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground text-sm">
                  Select an invoice from the table to view its details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
