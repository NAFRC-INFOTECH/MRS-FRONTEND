import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { doctorProfile } from "../types/doctorProfile";

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export const updateMyDoctorProfileApi = async (patch: DeepPartial<doctorProfile>): Promise<doctorProfile> => {
  const res = await api.patch("/doctor-profiles/me", patch);
  return res.data as doctorProfile;
};

export const completeMyOnboardingApi = async (): Promise<doctorProfile> => {
  const res = await api.post("/doctor-profiles/me/complete");
  return res.data as doctorProfile;
};

export const useDoctorProfileUpdateMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMyDoctorProfileApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-profile", "me"] });
      qc.invalidateQueries({ queryKey: ["doctor-profiles"] });
    },
  });
};

export const useCompleteOnboardingMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: completeMyOnboardingApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-profile", "me"] });
      qc.invalidateQueries({ queryKey: ["doctor-profiles"] });
    },
  });
};

export const updateDoctorStatusApi = async (userId: string, status: string): Promise<doctorProfile> => {
  const res = await api.patch(`/users/${encodeURIComponent(userId)}/doctor/status`, { status });
  const u = res.data as any;
  // map back into doctorProfile shape for consumer compatibility
  return {
    personalInfo: {
      id: String(u._id || u.id || ""),
      fullName: u.name || "",
      dateOfBirth: "",
      gender: "",
      nationality: u.country || "",
      state: u.state || "",
      phone: u.phone || "",
      email: u.email || "",
      address: u.address || "",
      idDocument: "",
      emergencyContact: u.emergencyPhone || "",
      imageUrl: u.imageUrl || "",
      hospital: u.doctor?.hospital || "",
      status: u.doctor?.status || "pending",
    },
    qualifications: {
      medicalDegree: u.doctor?.qualifications?.medicalDegree || "",
      specialization: u.doctor?.qualifications?.specialization || "",
      licenses: u.doctor?.qualifications?.licenses || "",
      boardCertifications: u.doctor?.qualifications?.boardCertifications || "",
      additionalCertifications: u.doctor?.qualifications?.additionalCertifications || "",
      medicalSchool: u.doctor?.qualifications?.medicalSchool || "",
      graduationYear: u.doctor?.qualifications?.graduationYear || "",
    },
    experience: { employers: "", jobTitles: "", responsibilities: "", references: "", specializedExperience: "" },
    cme: { workshops: "", research: "", fellowships: "" },
    skills: { clinicalSkills: "", surgicalExperience: "", equipment: "", leadership: "" },
    health: { medicalHistory: "", vaccinations: "", screenings: "" },
    legal: { licenseProof: "", backgroundCheck: "", insurance: "" },
    statement: { motivation: "", careerGoals: "", hospitalReason: "" },
    documents: { cv: "", photo: "", contract: "", availability: "" },
  } as doctorProfile;
};

export const deleteDoctorProfileApi = async (userId: string): Promise<{ ok: true }> => {
  const res = await api.delete(`/users/${encodeURIComponent(userId)}`);
  return res.data as { ok: true };
};

export const useUpdateDoctorStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) => updateDoctorStatusApi(userId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", "doctors"] });
    },
  });
};

export const useDeleteDoctorProfileMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteDoctorProfileApi(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", "doctors"] });
    },
  });
};

export const resetDoctorPasswordApi = async (userId: string): Promise<{ password: string }> => {
  const res = await api.patch(`/users/${encodeURIComponent(userId)}/reset-password`);
  return res.data as { password: string };
};

export const useResetDoctorPasswordMutation = () => {
  return useMutation({
    mutationFn: (userId: string) => resetDoctorPasswordApi(userId),
  });
};
