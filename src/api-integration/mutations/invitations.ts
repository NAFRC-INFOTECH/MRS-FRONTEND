import { useMutation } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import { useQuery } from "@tanstack/react-query";

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

export const createDoctorDirectApi = async (payload: { name: string; email: string }): Promise<{ id: string; email: string; name: string; password: string }> => {
  const res = await api.post("/invitations/doctor/direct", payload);
  return res.data as { id: string; email: string; name: string; password: string };
};

export const useCreateDoctorDirectMutation = () => {
  return useMutation({
    mutationFn: createDoctorDirectApi,
  });
};

export const createNurseDirectApi = async (payload: { name: string; email: string }): Promise<{ id: string; email: string; name: string; password: string }> => {
  const res = await api.post("/invitations/nurse/direct", payload);
  return res.data as { id: string; email: string; name: string; password: string };
};

export const useCreateNurseDirectMutation = () => {
  return useMutation({
    mutationFn: createNurseDirectApi,
  });
};

export const createRecordingDirectApi = async (payload: { name: string; email: string }): Promise<{ id: string; email: string; name: string; password: string }> => {
  const res = await api.post("/invitations/recording/direct", payload);
  return res.data as { id: string; email: string; name: string; password: string };
};

export const useCreateRecordingDirectMutation = () => {
  return useMutation({
    mutationFn: createRecordingDirectApi,
  });
};

export const inviteNurseApi = async (payload: { email: string }): Promise<InvitationResponse> => {
  const res = await api.post("/invitations/nurse", payload);
  return res.data as InvitationResponse;
};

export const useInviteNurseMutation = () => {
  return useMutation({
    mutationFn: inviteNurseApi,
  });
};

export type InvitationInfo = {
  valid: boolean;
  email: string;
  role: string;
  status: string;
};

export const getInvitationByTokenApi = async (token: string): Promise<InvitationInfo> => {
  const res = await api.get(`/invitations/${encodeURIComponent(token)}`);
  return res.data as InvitationInfo;
};

export const useInvitationLookupQuery = (token: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: () => getInvitationByTokenApi(token),
    enabled,
  });
};

export const acceptInvitationApi = async (payload: { token: string; email: string; password: string; name?: string }): Promise<{ ok: boolean }> => {
  const res = await api.post("/invitations/accept", payload);
  return res.data as { ok: boolean };
};

export const useAcceptInvitationMutation = () => {
  return useMutation({
    mutationFn: acceptInvitationApi,
  });
};
