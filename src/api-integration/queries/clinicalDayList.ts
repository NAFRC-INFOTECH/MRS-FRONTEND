import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export const getClinicalDayListApi = async (opts?: { targetDepartment?: "EarDoctor" | "EyeDoctor"; sourceDepartment?: string; range?: "today" | "all"; start?: string; end?: string }): Promise<any[]> => {
  const res = await api.get("/clinical/daylist", { params: opts });
  return res.data as any[];
};

export const useClinicalDayListQuery = (targetDepartment: "EarDoctor" | "EyeDoctor", range: "today" | "all" = "today", sourceDepartment?: string, start?: string, end?: string) => {
  return useQuery({
    queryKey: ["clinical", "daylist", targetDepartment, range, sourceDepartment || "all", start || "none", end || "none"],
    queryFn: () => getClinicalDayListApi({ targetDepartment, range, sourceDepartment, start, end }),
  });
};

