import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { LabReferral } from "../queries/lab";

export type CreateLabReferralPayload = {
  patientId: string | null;
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
};

export const createLabReferralApi = async (payload: CreateLabReferralPayload): Promise<LabReferral> => {
  const res = await api.post("/lab/referrals", payload);
  return res.data as LabReferral;
};

export const useCreateLabReferralMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLabReferralApi,
    onSuccess: (_data) => {
      qc.invalidateQueries({ queryKey: ["lab-referrals"] });
    },
  });
};

export const updateLabReferralStatusApi = async (id: string, status: "PENDING" | "RECEIVED" | "COMPLETED"): Promise<{ id: string; status: string }> => {
  const res = await api.put(`/lab/referrals/${encodeURIComponent(id)}/status`, { status });
  return res.data as { id: string; status: string };
};

export const useUpdateLabReferralStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PENDING" | "RECEIVED" | "COMPLETED" }) => updateLabReferralStatusApi(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lab-referrals"] });
    },
  });
};
