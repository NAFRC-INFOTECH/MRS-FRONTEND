import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";
import type { doctorProfile } from "../types/doctorProfile";

export const getDoctorsApi = async (): Promise<doctorProfile[]> => {
  const res = await api.get("/users", { params: { role: "doctor" } });
  const users = res.data as any[];
  return (users || []).map((u) => {
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
  });
};

export const useDoctorsQuery = () => {
  return useQuery({
    queryKey: ["users", "doctors"],
    queryFn: getDoctorsApi,
  });
};

export const getMyDoctorProfileApi = async (): Promise<doctorProfile> => {
  const res = await api.get("/doctor-profiles/me");
  return res.data as doctorProfile;
};

export const getDoctorProfileByIdApi = async (userId: string): Promise<doctorProfile> => {
  const res = await api.get(`/doctor-profiles/${encodeURIComponent(userId)}`);
  return res.data as doctorProfile;
};

export const useDoctorProfileMeQuery = () => {
  return useQuery({
    queryKey: ["doctor-profile", "me"],
    queryFn: getMyDoctorProfileApi,
  });
};

export const useDoctorProfileByIdQuery = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ["doctor-profile", userId],
    queryFn: () => getDoctorProfileByIdApi(userId),
    enabled: !!userId && enabled,
  });
};
