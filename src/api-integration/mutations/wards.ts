import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { WardAdmissionRow, WardMedicationOrder } from "../queries/wards";

export const admitToWardApi = async (payload: {
  patientId: string;
  wardUnit: string;
  bedPriceItemId: string;
  quantity?: number;
  pharmacyPrescription?: string;
  medicationOrders?: WardMedicationOrder[];
}): Promise<WardAdmissionRow> => {
  const res = await api.post("/wards/admissions", payload);
  return res.data as WardAdmissionRow;
};

export const dischargeWardAdmissionApi = async (id: string): Promise<WardAdmissionRow> => {
  const res = await api.patch(`/wards/admissions/${encodeURIComponent(id)}/discharge`);
  return res.data as WardAdmissionRow;
};

export const useAdmitToWardMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: admitToWardApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wards", "admissions"] });
      qc.invalidateQueries({ queryKey: ["patients", "pharmacy"] });
    },
  });
};

export const useDischargeWardAdmissionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: dischargeWardAdmissionApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wards", "admissions"] });
    },
  });
};

export const administerWardMedicationApi = async (payload: { admissionId: string; drugPriceItemId: string; scheduledAt: string }): Promise<WardAdmissionRow> => {
  const res = await api.post(`/wards/admissions/${encodeURIComponent(payload.admissionId)}/medications/administer`, {
    drugPriceItemId: payload.drugPriceItemId,
    scheduledAt: payload.scheduledAt,
  });
  return res.data as WardAdmissionRow;
};

export const useAdministerWardMedicationMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: administerWardMedicationApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wards", "admissions"] });
    },
  });
};

export const updateWardMedicationOrdersApi = async (payload: {
  admissionId: string;
  pharmacyPrescription?: string;
  medicationOrders: WardMedicationOrder[];
}): Promise<WardAdmissionRow> => {
  const res = await api.patch(`/wards/admissions/${encodeURIComponent(payload.admissionId)}/medications`, {
    pharmacyPrescription: payload.pharmacyPrescription,
    medicationOrders: payload.medicationOrders,
  });
  return res.data as WardAdmissionRow;
};

export const useUpdateWardMedicationOrdersMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateWardMedicationOrdersApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wards", "admissions"] });
    },
  });
};
