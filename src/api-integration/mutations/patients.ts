import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { Patient } from "../queries/patients";

export const createPatientApi = async (payload: Partial<Patient>): Promise<Patient> => {
  const res = await api.post("/patients", payload);
  return res.data as Patient;
};

export const updatePatientApi = async (id: string, payload: Partial<Patient>): Promise<Patient> => {
  const res = await api.patch(`/patients/${encodeURIComponent(id)}`, payload);
  return res.data as Patient;
};

export const useCreatePatientMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPatientApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};

export const useUpdatePatientMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) => updatePatientApi(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      qc.invalidateQueries({ queryKey: ["patient", vars.id] });
    },
  });
};

export const deletePatientApi = async (id: string): Promise<{ ok: true }> => {
  const res = await api.delete(`/patients/${encodeURIComponent(id)}`);
  return res.data as { ok: true };
};

export const useDeletePatientMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePatientApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};
