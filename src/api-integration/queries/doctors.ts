import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { doctorProfile } from "../types/doctorProfile";

export const getDoctorsApi = async (): Promise<doctorProfile[]> => {
  const res = await api.get("/doctor-profiles");
  return res.data as doctorProfile[];
};

export const useDoctorsQuery = () => {
  return useQuery({
    queryKey: ["doctor-profiles"],
    queryFn: getDoctorsApi,
  });
};

export const getMyDoctorProfileApi = async (): Promise<doctorProfile> => {
  const res = await api.get("/doctor-profiles/me");
  return res.data as doctorProfile;
};

export const useDoctorProfileMeQuery = () => {
  return useQuery({
    queryKey: ["doctor-profile", "me"],
    queryFn: getMyDoctorProfileApi,
  });
};
