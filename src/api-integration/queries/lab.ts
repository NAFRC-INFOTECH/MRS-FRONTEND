import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";
 
export type LabReferral = {
  id: string;
  patientId: string;
  senderId: string;
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
  status: "PENDING" | "RECEIVED" | "COMPLETED";
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
