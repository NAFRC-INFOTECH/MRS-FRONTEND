import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type UserLite = {
  _id: string;
  email: string;
  name: string;
  imageUrl?: string;
  roles: string[];
  suspended?: boolean;
};

export const getUsersApi = async (params?: { role?: string }): Promise<UserLite[]> => {
  const res = await api.get("/users", { params });
  return res.data as UserLite[];
};

export const useUsersQuery = (role?: string) => {
  return useQuery({
    queryKey: ["users", role ?? "all"],
    queryFn: () => getUsersApi(role ? { role } : undefined),
  });
};
