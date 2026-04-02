import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export const addDoctorReportApi = async (payload: { patientId: string; text?: string; imageUrl?: string; replyToId?: string }) => {
  const res = await api.post("/doctors/reports", payload);
  return res.data;
};

export const useAddDoctorReportMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addDoctorReportApi,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["doctors", "reports", variables.patientId] });
    },
  });
};

export const updateDoctorReportApi = async (payload: { id: string; patientId: string; text?: string; imageUrl?: string }) => {
  const res = await api.put(`/doctors/reports/${encodeURIComponent(payload.id)}`, { text: payload.text, imageUrl: payload.imageUrl });
  return res.data;
};

export const useUpdateDoctorReportMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateDoctorReportApi,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["doctors", "reports", variables.patientId] });
    },
  });
};

export const deleteDoctorReportApi = async (payload: { id: string; patientId: string }) => {
  const res = await api.delete(`/doctors/reports/${encodeURIComponent(payload.id)}`);
  return res.data;
};

export const useDeleteDoctorReportMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDoctorReportApi,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["doctors", "reports", variables.patientId] });
    },
  });
};
