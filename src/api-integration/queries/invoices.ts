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

export type Invoice = {
  _id: string;
  patientId: string;
  patientName: string;
  patientCardNumber: string;
  drugs: InvoiceDrugItem[];
  totalCost: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};

export const createInvoiceApi = async (patientId: string, drugs: InvoiceDrugItem[]): Promise<Invoice> => {
  const res = await api.post("/invoices", { patientId, drugs });
  return res.data as Invoice;
};

export const getAllInvoicesApi = async (): Promise<Invoice[]> => {
  const res = await api.get("/invoices");
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

export const useInvoicesByPatientIdQuery = (patientId?: string) => {
  return useQuery({
    queryKey: ["invoices", "patient", patientId],
    queryFn: () => getInvoicesByPatientIdApi(patientId || ""),
    enabled: !!patientId,
  });
};
