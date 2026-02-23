import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { doctorProfile } from "../types/doctorProfile";

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export const updateMyDoctorProfileApi = async (patch: DeepPartial<doctorProfile>): Promise<doctorProfile> => {
  const res = await api.patch("/doctor-profiles/me", patch);
  return res.data as doctorProfile;
};

export const completeMyOnboardingApi = async (): Promise<doctorProfile> => {
  const res = await api.post("/doctor-profiles/me/complete");
  return res.data as doctorProfile;
};

export const useDoctorProfileUpdateMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMyDoctorProfileApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-profile", "me"] });
      qc.invalidateQueries({ queryKey: ["doctor-profiles"] });
    },
  });
};

export const useCompleteOnboardingMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeMyOnboardingApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-profile", "me"] });
      qc.invalidateQueries({ queryKey: ["doctor-profiles"] });
    },
  });
};
