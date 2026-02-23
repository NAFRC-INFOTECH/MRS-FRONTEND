import { useMutation } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type InvitationResponse = {
  token: string;
  email: string;
  role: string;
  status: string;
};

export const inviteDoctorApi = async (payload: { email: string }): Promise<InvitationResponse> => {
  const res = await api.post("/invitations/doctor", payload);
  return res.data as InvitationResponse;
};

export const useInviteDoctorMutation = () => {
  return useMutation({
    mutationFn: inviteDoctorApi,
  });
};
