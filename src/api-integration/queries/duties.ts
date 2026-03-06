import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type DutyShift = "MORNING" | "AFTERNOON" | "NIGHT";
export type DutyStatus = "ON_DUTY" | "COMPLETED" | "ABSENT" | "SWAPPED";

export type DutyRecord = {
  _id: string;
  doctorUserId?: string;
  nurseUserId?: string;
  departmentId: string;
  date: string;
  shift: DutyShift;
  timeIn: string;
  timeOut: string;
  status: DutyStatus;
  assignedBy: string;
};

export const getDutiesApi = async (params?: { role?: "doctor" | "nurse"; departmentId?: string; date?: string; shift?: DutyShift }): Promise<DutyRecord[]> => {
  const res = await api.get("/duties", { params });
  return res.data as DutyRecord[];
};

export const useDutiesQuery = (params?: { role?: "doctor" | "nurse"; departmentId?: string; date?: string; shift?: DutyShift }) => {
  return useQuery({
    queryKey: ["duties", params?.role ?? "all", params?.departmentId ?? "all", params?.date ?? "all", params?.shift ?? "all"],
    queryFn: () => getDutiesApi(params),
  });
};
