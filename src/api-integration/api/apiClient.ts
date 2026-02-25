import axios from "axios";
import { API_BASE_URL } from "./config";
import { store } from "../redux/store";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    (config.headers as any) = {
      ...(config.headers as any),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const resp = error?.response;
    const message =
      resp?.data?.message ||
      resp?.data?.error ||
      error?.message ||
      "Request failed";
    return Promise.reject(new Error(message));
  }
);
