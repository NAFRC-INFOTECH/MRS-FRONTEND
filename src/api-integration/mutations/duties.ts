import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { DutyRecord, DutyShift, DutyStatus } from "../queries/duties";

export const createDutyApi = async (payload: { role: "doctor" | "nurse"; staffId: string; departmentId: string; date: string; shift: DutyShift; timeIn: string; timeOut: string; status: DutyStatus; assignedBy: string }): Promise<DutyRecord> => {
  const res = await api.post("/duties", payload);
  return res.data as DutyRecord;
};

export const useCreateDutyMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDutyApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["duties"] });
    },
  });
};

export const updateDutyApi = async (id: string, payload: Partial<{ departmentId: string; date: string; shift: DutyShift; timeIn: string; timeOut: string; status: DutyStatus }>): Promise<DutyRecord> => {
  const res = await api.patch(`/duties/${encodeURIComponent(id)}`, payload);
  return res.data as DutyRecord;
};

export const deleteDutyApi = async (id: string): Promise<{ ok: boolean }> => {
  const res = await api.delete(`/duties/${encodeURIComponent(id)}`);
  return res.data as { ok: boolean };
};

export const useUpdateDutyMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ departmentId: string; date: string; shift: DutyShift; timeIn: string; timeOut: string; status: DutyStatus }> }) => updateDutyApi(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["duties"] });
    },
  });
};

export const useDeleteDutyMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDutyApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["duties"] });
    },
  });
};
