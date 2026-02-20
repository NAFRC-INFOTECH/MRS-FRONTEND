import { useAppSelector } from "./store";
import type { Role } from "../types/types";

export const useIsAuthenticated = () => useAppSelector((s) => s.auth.isAuthenticated);
export const useUser = () => useAppSelector((s) => s.auth.user);
export const useRoles = (): Role[] => useAppSelector((s) => s.auth.user?.roles || []);
export const useAccessToken = () => useAppSelector((s) => s.auth.accessToken);
