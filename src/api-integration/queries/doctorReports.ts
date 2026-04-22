import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type DoctorReport = {
  id: string;
  patientId: string;
  senderId: string;
  senderName?: string;
  doctorName?: string;
  text?: string;
  clinicalNote?: string;
  diagnosis?: string;
  imageUrl?: string;
  replyToId?: string;
  createdAt: string;
};

export const getDoctorReportsApi = async (patientId: string): Promise<DoctorReport[]> => {
  const res = await api.get("/doctors/reports", { params: { patientId } });
  return res.data as DoctorReport[];
};

export const useDoctorReportsQuery = (patientId?: string) => {
  return useQuery({
    queryKey: ["doctors", "reports", patientId || "none"],
    queryFn: () => getDoctorReportsApi(patientId as string),
    enabled: !!patientId,
  });
};
