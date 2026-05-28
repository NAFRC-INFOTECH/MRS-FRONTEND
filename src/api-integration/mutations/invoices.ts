import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createInvoiceApi,
  markInvoiceCopayPaidApi,
  stampInvoiceNHIAApi,
  updateInvoicePaymentStatusApi,
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
    }: {
      patientId: string;
      drugs?: InvoiceDrugItem[];
      items?: InvoiceItem[];
    }) => createInvoiceApi({ patientId, drugs, items }),
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
