import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelInvoiceApi,
  createInvoiceApi,
  markInvoiceCopayPaidApi,
  stampInvoiceNHIAApi,
  updateInvoicePaymentStatusApi,
  updateInvoiceItemsApi,
  type BillingRoute,
  type InvoiceDrugItem,
  type InvoiceItem,
  type PaymentStatus,
} from "../queries/invoices";

export const useCreateInvoiceMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      patientId,
      drugs,
      items,
      preferredBillingRoute,
    }: {
      patientId: string;
      drugs?: InvoiceDrugItem[];
      items?: InvoiceItem[];
      preferredBillingRoute?: BillingRoute;
    }) => createInvoiceApi({ patientId, drugs, items, preferredBillingRoute }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["invoices", "patient", data.patientId] });
      qc.invalidateQueries({ queryKey: ["invoices", "all"] });
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useStampInvoiceNHIAMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) => stampInvoiceNHIAApi(invoiceId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoices", "patient", data.patientId] });
      qc.invalidateQueries({ queryKey: ["invoices", "all"] });
    },
  });
};

export const useMarkInvoiceCopayPaidMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) => markInvoiceCopayPaidApi(invoiceId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoices", "patient", data.patientId] });
      qc.invalidateQueries({ queryKey: ["invoices", "all"] });
    },
  });
};

export const useUpdateInvoiceItemsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, items }: { invoiceId: string; items: InvoiceItem[] }) => updateInvoiceItemsApi(invoiceId, items),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoices", "patient", data.patientId] });
      qc.invalidateQueries({ queryKey: ["invoices", "all"] });
      qc.invalidateQueries({ queryKey: ["invoices", "detail", data._id] });
    },
  });
};

export const useCancelInvoiceMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) => cancelInvoiceApi(invoiceId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoices", "patient", data.patientId] });
      qc.invalidateQueries({ queryKey: ["invoices", "all"] });
      qc.invalidateQueries({ queryKey: ["invoices", "detail", data._id] });
    },
  });
};
