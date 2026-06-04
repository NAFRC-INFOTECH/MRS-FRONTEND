import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export const PAYMENT_STATUS = {
  AWAITING: "awaiting",
  PAID: "paid",
  CANCELED: "canceled",
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const BILLING_ROUTE = {
  PAYPOINT: "paypoint",
  NHIA: "nhia",
} as const;

export type BillingRoute = typeof BILLING_ROUTE[keyof typeof BILLING_ROUTE];

export const NHIA_STAMP_STATUS = {
  AWAITING: "awaiting",
  STAMPED: "stamped",
} as const;

export type NHIAStampStatus = typeof NHIA_STAMP_STATUS[keyof typeof NHIA_STAMP_STATUS];

export const COPAY_STATUS = {
  AWAITING: "awaiting",
  PAID: "paid",
} as const;

export type CopayStatus = typeof COPAY_STATUS[keyof typeof COPAY_STATUS];

export type InvoiceDrugItem = {
  priceItemId?: string;
  category?: string;
  unit?: string;
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
  paidByRole?: string;
  paidByUserId?: string;
  paidAt?: string;
  patientName: string;
  patientCardNumber: string;
  drugs: InvoiceDrugItem[];
  items?: InvoiceItem[];
  totalCost: number;
  paymentStatus: PaymentStatus;
  billingRoute?: BillingRoute;
  patientIsPersonnel?: boolean;
  patientHasNHIAAccess?: boolean;
  patientCopayPercent?: number;
  patientCopayAmount?: number;
  patientAmountDue?: number;
  nhiaAmountDue?: number;
  copayStatus?: CopayStatus;
  copayPaidAt?: string;
  nhiaStampStatus?: NHIAStampStatus;
  nhiaStampedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export const createInvoiceApi = async (payload: {
  patientId: string;
  drugs?: InvoiceDrugItem[];
  items?: InvoiceItem[];
  preferredBillingRoute?: BillingRoute;
}): Promise<Invoice> => {
  const res = await api.post("/invoices", payload);
  return res.data as Invoice;
};

export const getAllInvoicesApi = async (): Promise<Invoice[]> => {
  const res = await api.get("/invoices");
  return res.data as Invoice[];
};

export const getInvoicesApi = async (params?: {
  createdByRole?: string;
  createdByUserId?: string;
  paymentStatus?: PaymentStatus;
  paidByRole?: string;
  paidFrom?: string;
  paidTo?: string;
  billingRoute?: BillingRoute;
  nhiaStampStatus?: NHIAStampStatus;
  copayStatus?: CopayStatus;
}): Promise<Invoice[]> => {
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

export const stampInvoiceNHIAApi = async (invoiceId: string): Promise<Invoice> => {
  const res = await api.patch(`/invoices/${encodeURIComponent(invoiceId)}/nhia/stamp`);
  return res.data as Invoice;
};

export const markInvoiceCopayPaidApi = async (invoiceId: string): Promise<Invoice> => {
  const res = await api.patch(`/invoices/${encodeURIComponent(invoiceId)}/nhia/copay-paid`);
  return res.data as Invoice;
};

export const updateInvoiceItemsApi = async (invoiceId: string, items: InvoiceItem[]): Promise<Invoice> => {
  const res = await api.patch(`/invoices/${encodeURIComponent(invoiceId)}/items`, { items });
  return res.data as Invoice;
};

export const cancelInvoiceApi = async (invoiceId: string): Promise<Invoice> => {
  const res = await api.patch(`/invoices/${encodeURIComponent(invoiceId)}/cancel`);
  return res.data as Invoice;
};

export const useAllInvoicesQuery = () => {
  return useQuery({
    queryKey: ["invoices", "all"],
    queryFn: getAllInvoicesApi,
  });
};

export const useInvoicesQuery = (params?: {
  createdByRole?: string;
  createdByUserId?: string;
  paymentStatus?: PaymentStatus;
  paidByRole?: string;
  paidFrom?: string;
  paidTo?: string;
  billingRoute?: BillingRoute;
  nhiaStampStatus?: NHIAStampStatus;
  copayStatus?: CopayStatus;
}) => {
  return useQuery({
    queryKey: [
      "invoices",
      "list",
      params?.createdByRole ?? "",
      params?.createdByUserId ?? "",
      params?.paymentStatus ?? "",
      params?.paidByRole ?? "",
      params?.paidFrom ?? "",
      params?.paidTo ?? "",
      params?.billingRoute ?? "",
      params?.nhiaStampStatus ?? "",
      params?.copayStatus ?? "",
    ],
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
