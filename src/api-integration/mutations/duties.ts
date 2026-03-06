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
