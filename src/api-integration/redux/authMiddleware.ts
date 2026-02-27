import type { Middleware } from "@reduxjs/toolkit";
import { setTokens, setUser, logout } from "./authSlice";
import type { Role } from "../types/types";

export const authMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);
  if (setTokens.match(action)) {
    const accessToken = action.payload.accessToken;
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1])) as {
        sub: string;
        email: string;
        roles: Role[];
        fullName?: string;
      };
      storeApi.dispatch(setUser({ id: payload.sub, email: payload.email, roles: payload.roles, name: payload.fullName ?? "", imageUrl: "" }));
    } catch {}
    const state = storeApi.getState() as any;
    try {
      localStorage.setItem(
        "auth",
        JSON.stringify({
          accessToken: state.auth.accessToken,
          refreshToken: state.auth.refreshToken,
          user: state.auth.user,
        })
      );
    } catch {}
  }
  if (logout.match(action)) {
    storeApi.dispatch(setUser({ id: "", email: "", roles: [], name: "", imageUrl: "" }));
    try {
      localStorage.removeItem("auth");
    } catch {}
  }
  if (setUser.match(action)) {
    const state = storeApi.getState() as any;
    try {
      localStorage.setItem(
        "auth",
        JSON.stringify({
          accessToken: state.auth.accessToken,
          refreshToken: state.auth.refreshToken,
          user: state.auth.user,
        })
      );
    } catch {}
  }
  return result;
};
