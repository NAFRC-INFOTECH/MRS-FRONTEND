import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type Department = { _id: string; name: string; description?: string; createdAt?: string; updatedAt?: string };

export const getDepartmentsApi = async (): Promise<Department[]> => {
  const res = await api.get("/departments");
  return res.data as Department[];
};

export const useDepartmentsQuery = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartmentsApi(),
  });
};
