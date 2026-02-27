import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { Profile } from "../types/profile";

export const updateProfileApi = async (
  payload: Profile
): Promise<Profile> => {
  const res = await api.patch(`/profile/me`, payload);
  return res.data as Profile;
};

export const useProfileUpdateMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Profile) => updateProfileApi(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
};

export const uploadProfileImageApi = async (file: File): Promise<{ imageUrl: string }> => {
  const form = new FormData();
  form.append("image", file);
  const res = await api.post("/profile/me/image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data as { imageUrl: string };
};

export const useProfileImageUploadMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadProfileImageApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
};

export const changePasswordApi = async (payload: { currentPassword: string; newPassword: string }): Promise<{ ok: boolean }> => {
  const res = await api.patch("/profile/me/password", payload);
  return res.data as { ok: boolean };
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: changePasswordApi,
  });
};
