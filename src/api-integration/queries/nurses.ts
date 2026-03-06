import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type NurseUser = {
  _id: string;
  email: string;
  name: string;
  imageUrl?: string;
  roles: string[];
  department?: string;
};

export const getNursesApi = async (params?: { department?: string }): Promise<NurseUser[]> => {
  const res = await api.get("/nurses", { params });
  return res.data as NurseUser[];
};

export const useNursesQuery = (enabled = true, params?: { department?: string }) => {
  return useQuery({
    queryKey: ["users", "nurses"],
    queryFn: () => getNursesApi(params),
    enabled,
  });
};
