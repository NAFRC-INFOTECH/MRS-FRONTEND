import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createInvoiceApi,
  updateInvoicePaymentStatusApi,
  type InvoiceDrugItem,
  type PaymentStatus,
} from "../queries/invoices";

export const useCreateInvoiceMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      patientId,
      drugs,
    }: {
      patientId: string;
      drugs: InvoiceDrugItem[];
    }) => createInvoiceApi(patientId, drugs),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["invoices", "patient", vars.patientId] });
    },
  });
};

export const useUpdateInvoicePaymentStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      invoiceId,
      paymentStatus,
    }: {
      invoiceId: string;
      paymentStatus: PaymentStatus;
    }) => updateInvoicePaymentStatusApi(invoiceId, paymentStatus),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};
