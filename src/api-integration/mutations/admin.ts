import { useMutation } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type CreateAdminPayload = {
  name: string;
  email: string;
  password: string;
};

export type CreatedAdmin = {
  _id: string;
  email: string;
  name: string;
  roles?: string[];
};

export const createAdminApi = async (payload: CreateAdminPayload): Promise<CreatedAdmin> => {
  const res = await api.post("/admin/signup", payload);
  return res.data as CreatedAdmin;
};

export const useCreateAdminMutation = () => {
  return useMutation({
    mutationFn: createAdminApi,
  });
};
