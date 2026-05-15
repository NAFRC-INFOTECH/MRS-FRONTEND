import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";
 
export type LabReferral = {
  id: string;
  patientId: string;
  senderId: string;
  senderName?: string;
  senderEmail?: string;
  date: string;
  serviceNoOrUUID?: string;
  rank?: string;
  forenames?: string;
  surname?: string;
  wardNo?: string;
  hospitalUnit?: string;
  age?: string;
  to?: string;
  specimen?: string;
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
 
export const getLabReferralsApi = async (status?: string): Promise<LabReferral[]> => {
  const res = await api.get("/lab/referrals", { params: status ? { status } : undefined });
  return res.data as LabReferral[];
};
 
export const useLabReferralsQuery = (status?: string) => {
  return useQuery({
    queryKey: ["lab-referrals", status ?? ""],
    queryFn: () => getLabReferralsApi(status),
  });
};

export const getLabReferralsByDateApi = async (date: string, status?: string): Promise<LabReferral[]> => {
  const params: Record<string, string> = { date };
  if (status) params.status = status;
  const res = await api.get("/lab/referrals", { params });
  return res.data as LabReferral[];
};

export const useLabReferralsByDateQuery = (date: string, status?: string) => {
  return useQuery({
    queryKey: ["lab-referrals", "by-date", date, status ?? ""],
    queryFn: () => getLabReferralsByDateApi(date, status),
    enabled: !!date,
  });
};

export const getLabReferralsByPatientApi = async (
  patientId: string,
  params?: { period?: "daily" | "monthly" | "yearly"; value?: string; status?: string }
): Promise<LabReferral[]> => {
  const res = await api.get(`/lab/referrals`, { params: { ...params, patientId } });
  return res.data as LabReferral[];
};

export const useLabReferralsByPatientQuery = (
  patientId?: string,
  params?: { period?: "daily" | "monthly" | "yearly"; value?: string; status?: string }
) => {
  return useQuery({
    queryKey: ["lab-referrals", "patient", patientId ?? "none", params?.period ?? "daily", params?.value ?? "", params?.status ?? ""],
    queryFn: () => getLabReferralsByPatientApi(patientId || "", params),
    enabled: !!patientId,
  });
};
