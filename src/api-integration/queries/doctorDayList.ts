import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export const getDoctorDayListApi = async (opts?: { sourceDepartment?: string; range?: "today" | "all"; start?: string; end?: string }): Promise<any[]> => {
  const res = await api.get("/doctors/daylist", { params: opts });
  return res.data as any[];
};

export const useDoctorDayListQuery = (sourceDepartment?: string, range: "today" | "all" = "today", start?: string, end?: string) => {
  return useQuery({
    queryKey: ["doctors", "daylist", range, sourceDepartment || "all", start || "none", end || "none"],
    queryFn: () => getDoctorDayListApi({ sourceDepartment, range, start, end }),
  });
};
