import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { Profile } from "../types/profile";
import type { doctorProfile } from "../types/doctorProfile";
import { useIsAuthenticated } from "../redux/selectors";

export const getProfileApi = async (): Promise<Profile> => {
  const res = await api.get("/profile/me");
  const data = res.data as Profile | null;
  if (data && (data.name !== undefined || data.email !== undefined)) return data;
  
  // Fallback for doctor profiles if the unified endpoint fails or returns partial data
  // Note: The unified endpoint /profile/me is now the preferred way.
  try {
    const dp = await api.get("/doctor-profiles/me");
    const d = dp.data as doctorProfile;
    return {
      name: d?.personalInfo?.fullName ?? "",
      email: d?.personalInfo?.email ?? "",
      imageUrl: d?.personalInfo?.imageUrl ?? "",
      phone: d?.personalInfo?.phone ?? "",
      address: d?.personalInfo?.address ?? "",
      country: d?.personalInfo?.nationality ?? "",
      state: d?.personalInfo?.state ?? "",
      emergencyPhone: d?.personalInfo?.emergencyContact ?? "",
    } as Profile;
  } catch {
    return {} as Profile;
  }
};

export const useProfileQuery = () => {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: getProfileApi,
    enabled: isAuthenticated,
  });
};
