type ViteEnv = { VITE_API_URL?: string };
const viteEnv = (import.meta as unknown as { env?: ViteEnv }).env;
export const API_BASE_URL = viteEnv?.VITE_API_URL ?? "http://localhost:8000/api/v1";
