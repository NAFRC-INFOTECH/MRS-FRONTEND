import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { Patient, DrugItem } from "../queries/patients";
import { addPatientToPharmacyApi, updatePharmacyDeskStateApi } from "../queries/patients";

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
      qc.invalidateQueries({ queryKey: ["patients", "paypoint"] });
      qc.invalidateQueries({ queryKey: ["patients", "nhia"] });
      qc.invalidateQueries({ queryKey: ["patient", vars.id] });
      qc.invalidateQueries({ queryKey: ["gopd-queue"] });
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
      qc.invalidateQueries({ queryKey: ["patients", "paypoint"] });
      qc.invalidateQueries({ queryKey: ["patients", "nhia"] });
    },
  });
};

export const useAddPatientToPharmacyMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, prescription, drugs }: { patientId: string; prescription?: string; drugs?: DrugItem[] }) => addPatientToPharmacyApi(patientId, { prescription, drugs }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients", "pharmacy"] });
    },
  });
};

export const useUpdatePharmacyDeskStateMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, deskState, prescription, drugs }: { patientId: string; deskState: string; prescription?: string; drugs?: DrugItem[] }) => updatePharmacyDeskStateApi(patientId, deskState, { prescription, drugs }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients", "pharmacy"] });
    },
  });
};
