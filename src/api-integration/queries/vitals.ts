import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export const getVitalsApi = async (patientId: string) => {
  const res = await api.get("/gopd/vitals", { params: { patientId } });
  return res.data as any[];
};

export const useVitalsQuery = (patientId?: string) => {
  return useQuery({
    queryKey: ["gopd", "vitals", patientId ?? "none"],
    queryFn: () => getVitalsApi(patientId!),
    enabled: !!patientId,
  });
};
