import { useMutation } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import { useAppDispatch } from "../redux/store";
import { setTokens, logout } from "../redux/authSlice";
import type { Role } from "../types/types";

export type Tokens = { accessToken: string; refreshToken: string };
export type CreatedUser = { id: string; email: string; name: string; roles: Role[] };

export const loginApi = async (payload: { email: string; password: string }): Promise<Tokens> => {
  const res = await api.post("/auth/login", payload);
  return res.data as Tokens;
};

export const registerApi = async (payload: { fullName: string; email: string; password: string }): Promise<CreatedUser> => {
  const res = await api.post("/auth/register", {
    name: payload.fullName,
    email: payload.email,
    password: payload.password,
  });
  return res.data as CreatedUser;
};

export const logoutApi = async () => {
  await api.post("/auth/logout");
};

export const useLoginMutation = () => {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (tokens) => {
      dispatch(setTokens(tokens));
    },
  });
};

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: registerApi,
  });
};

export const useLogoutMutation = () => {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      dispatch(logout());
    },
  });
};
