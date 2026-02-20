import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { authMiddleware } from "./authMiddleware";

const persisted = (() => {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return {
      auth: {
        accessToken: parsed.accessToken ?? null,
        refreshToken: parsed.refreshToken ?? null,
        user: parsed.user ?? null,
        isAuthenticated: !!parsed.accessToken,
      },
    };
  } catch {
    return undefined;
  }
})();

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authMiddleware),
  preloadedState: persisted,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
