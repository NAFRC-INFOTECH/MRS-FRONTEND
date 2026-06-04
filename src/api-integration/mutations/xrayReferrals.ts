import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { XrayReferral } from "../queries/xray";

export type CreateXrayReferralPayload = {
  patientId: string | null;
  invoiceId?: string;
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
};

export const createXrayReferralApi = async (payload: CreateXrayReferralPayload): Promise<XrayReferral> => {
  const res = await api.post("/radiology/referrals", payload);
  return res.data as XrayReferral;
};

export const useCreateXrayReferralMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createXrayReferralApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["xray-referrals"] });
    },
  });
};

export const updateXrayReferralStatusApi = async (id: string, status: "PENDING" | "RECEIVED" | "COMPLETED"): Promise<{ id: string; status: string }> => {
  const res = await api.put(`/radiology/referrals/${encodeURIComponent(id)}/status`, { status });
  return res.data as { id: string; status: string };
};

export const useUpdateXrayReferralStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PENDING" | "RECEIVED" | "COMPLETED" }) => updateXrayReferralStatusApi(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["xray-referrals"] });
    },
  });
};

export const updateXrayReferralResultsApi = async (
  id: string,
  testResults: Record<string, string>
): Promise<{ id: string; testResults: Record<string, string> }> => {
  const res = await api.put(`/radiology/referrals/${encodeURIComponent(id)}/results`, {
    testResults,
  });
  return res.data as { id: string; testResults: Record<string, string> };
};

export const useUpdateXrayReferralResultsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, testResults }: { id: string; testResults: Record<string, string> }) =>
      updateXrayReferralResultsApi(id, testResults),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["xray-referrals"] });
    },
  });
};
