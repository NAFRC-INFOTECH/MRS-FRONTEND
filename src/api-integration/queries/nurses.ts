import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type NurseUser = {
  _id: string;
  email: string;
  name: string;
  imageUrl?: string;
  roles: string[];
};

export const getNursesApi = async (): Promise<NurseUser[]> => {
  const res = await api.get("/users", { params: { role: "nurse" } });
  return res.data as NurseUser[];
};

export const useNursesQuery = () => {
  return useQuery({
    queryKey: ["users", "nurses"],
    queryFn: getNursesApi,
  });
};
