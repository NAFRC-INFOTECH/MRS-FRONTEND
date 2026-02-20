import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { Profile } from "../types/profile";
import { useIsAuthenticated } from "../redux/selectors";

export const getProfileApi = async (): Promise<Profile> => {
  const res = await api.get("/profile/me");
  return res.data as Profile;
};

export const useProfileQuery = () => {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: getProfileApi,
    enabled: isAuthenticated,
  });
};
