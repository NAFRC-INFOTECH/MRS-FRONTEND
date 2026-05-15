import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export const PAYMENT_STATUS = {
  AWAITING: "awaiting",
  PAID: "paid",
  CANCELED: "canceled",
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export type InvoiceDrugItem = {
  name: string;
  dosage: string;
  quantity: number;
  instructions?: string;
  unitPrice: number;
  totalPrice: number;
};

export type InvoiceItem = {
  priceItemId?: string;
  category?: string;
  unit?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type Invoice = {
  _id: string;
  patientId: string;
  createdByRole?: string;
  createdByUserId?: string;
  patientName: string;
  patientCardNumber: string;
  drugs: InvoiceDrugItem[];
  items?: InvoiceItem[];
  totalCost: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};

export const createInvoiceApi = async (payload: {
  patientId: string;
  drugs?: InvoiceDrugItem[];
  items?: InvoiceItem[];
}): Promise<Invoice> => {
  const res = await api.post("/invoices", payload);
  return res.data as Invoice;
};

export const getAllInvoicesApi = async (): Promise<Invoice[]> => {
  const res = await api.get("/invoices");
  return res.data as Invoice[];
};

export const getInvoicesApi = async (params?: { createdByRole?: string; createdByUserId?: string }): Promise<Invoice[]> => {
  const res = await api.get("/invoices", { params });
  return res.data as Invoice[];
};

export const getInvoicesByPatientIdApi = async (patientId: string): Promise<Invoice[]> => {
  const res = await api.get(`/invoices/patient/${encodeURIComponent(patientId)}`);
  return res.data as Invoice[];
};

export const getInvoiceByIdApi = async (invoiceId: string): Promise<Invoice> => {
  const res = await api.get(`/invoices/${encodeURIComponent(invoiceId)}`);
  return res.data as Invoice;
};

export const updateInvoicePaymentStatusApi = async (
  invoiceId: string,
  paymentStatus: PaymentStatus
): Promise<Invoice> => {
  const res = await api.patch(`/invoices/${encodeURIComponent(invoiceId)}/payment-status`, { paymentStatus });
  return res.data as Invoice;
};

export const useAllInvoicesQuery = () => {
  return useQuery({
    queryKey: ["invoices", "all"],
    queryFn: getAllInvoicesApi,
  });
};

export const useInvoicesQuery = (params?: { createdByRole?: string; createdByUserId?: string }) => {
  return useQuery({
    queryKey: ["invoices", "list", params?.createdByRole ?? "", params?.createdByUserId ?? ""],
    queryFn: () => getInvoicesApi(params),
  });
};

export const useInvoicesByPatientIdQuery = (patientId?: string) => {
  return useQuery({
    queryKey: ["invoices", "patient", patientId],
    queryFn: () => getInvoicesByPatientIdApi(patientId || ""),
    enabled: !!patientId,
  });
};
