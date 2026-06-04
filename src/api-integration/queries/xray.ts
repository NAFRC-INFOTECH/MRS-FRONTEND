import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type XrayReferral = {
  id: string;
  patientId: string;
  senderId: string;
  senderName?: string;
  senderEmail?: string;
  invoiceId?: string;
  billingRoute?: "paypoint" | "nhia";
  paymentStatus?: string;
  nhiaStampStatus?: string;
  copayStatus?: string;
  patientAmountDue?: number;
  isCleared?: boolean;
  clearanceLabel?: string;
  date: string;
  serviceNoOrUUID?: string;
  rank?: string;
  forenames?: string;
  surname?: string;
  wardNo?: string;
  hospitalUnit?: string;
  age?: string;
  to?: string;
  imagingArea?: string;
  examinationRequired?: string;
  diagnosis?: string;
  statement?: string;
  previousReportNos?: string;
  previousReportDate?: string;
  testResults?: Record<string, string>;
  status: "PENDING" | "RECEIVED" | "COMPLETED";
  createdAt?: string;
  updatedAt?: string;
};

export const getXrayReferralsApi = async (params?: {
  status?: string;
  date?: string;
  patientId?: string;
  period?: "daily" | "monthly" | "yearly";
  value?: string;
}): Promise<XrayReferral[]> => {
  const res = await api.get("/radiology/referrals", { params });
  return res.data as XrayReferral[];
};

export const useXrayReferralsQuery = (params?: {
  status?: string;
  date?: string;
  patientId?: string;
  period?: "daily" | "monthly" | "yearly";
  value?: string;
}) => {
  return useQuery({
    queryKey: ["xray-referrals", params?.status ?? "", params?.date ?? "", params?.patientId ?? "", params?.period ?? "", params?.value ?? ""],
    queryFn: () => getXrayReferralsApi(params),
  });
};
