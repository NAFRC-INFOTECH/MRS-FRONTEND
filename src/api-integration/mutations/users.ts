import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export const deleteUserApi = async (id: string): Promise<{ ok: boolean }> => {
  const res = await api.delete(`/users/${id}`);
  return res.data as { ok: boolean };
};

export const useDeleteUserMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const suspendUserApi = async (id: string, suspended: boolean): Promise<{ ok: boolean }> => {
  const res = await api.patch(`/users/${id}/suspend`, { suspended });
  return res.data as { ok: boolean };
};

export const useSuspendUserMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, suspended }: { id: string; suspended: boolean }) => suspendUserApi(id, suspended),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
