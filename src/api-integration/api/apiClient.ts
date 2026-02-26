import axios from "axios";
import { API_BASE_URL } from "./config";
import { store } from "../redux/store";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    const headers = (config.headers as any) || {};
    headers.Authorization = `Bearer ${token}`;
    config.headers = headers;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: unknown) => {
    const err = error as { response?: { data?: { message?: string; error?: string } } } | undefined;
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      (error instanceof Error ? error.message : "Request failed");
    return Promise.reject(new Error(message));
  }
);
