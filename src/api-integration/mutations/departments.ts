import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { Department } from "../queries/departments";

export const createDepartmentApi = async (payload: { name: string; description?: string }): Promise<Department> => {
  const res = await api.post("/departments", payload);
  return res.data as any;
};

export const useCreateDepartmentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDepartmentApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};

export const updateDepartmentApi = async (id: string, payload: { name?: string; description?: string }): Promise<Department> => {
  const res = await api.patch(`/departments/${encodeURIComponent(id)}`, payload);
  return res.data as any;
};

export const useUpdateDepartmentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) => updateDepartmentApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};

export const deleteDepartmentApi = async (id: string): Promise<{ ok: boolean }> => {
  const res = await api.delete(`/departments/${encodeURIComponent(id)}`);
  return res.data as any;
};

export const useDeleteDepartmentMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDepartmentApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};
