import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type VitalPayload = {
  patientId: string;
  recordedAt?: string;
  temperature?: number;
  pulse?: number;
  respirationRate?: number;
  bp?: string;
  spo2?: number;
  fbsRbs?: string;
  height?: number;
  weight?: number;
};

export const createVitalApi = async (payload: VitalPayload) => {
  const res = await api.post("/gopd/vitals", payload);
  return res.data;
};

export const useCreateVitalMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createVitalApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gopd", "vitals"] });
    },
  });
};
