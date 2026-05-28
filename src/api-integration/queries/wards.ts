import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type WardAdmissionStatus = "admitted" | "discharged";

export type WardMedicationOrder = {
  priceItemId: string;
  name: string;
  quantity: number;
  instructions: string;
  usage: string;
};

export type WardMedicationAdministration = {
  drugPriceItemId: string;
  scheduledAt: string;
  administeredAt: string;
  administeredByRole?: string;
};

export type WardAdmissionRow = {
  _id: string;
  patientId: string;
  fullName: string;
  cardNumber: string;
  phone: string;
  rank: string;
  sex: string;
  age: number | null;
  wardUnit: string;
  bedPriceItemId: string;
  quantity: number;
  admittedAt: string;
  status: WardAdmissionStatus;
  dischargedAt: string | null;
  pharmacyPrescription?: string;
  medicationOrders?: WardMedicationOrder[];
  medicationAdministrations?: WardMedicationAdministration[];
};

export const getWardAdmissionsApi = async (params?: { wardUnit?: string; status?: WardAdmissionStatus | "all" }): Promise<WardAdmissionRow[]> => {
  const res = await api.get("/wards/admissions", { params });
  return res.data as WardAdmissionRow[];
};

export const useWardAdmissionsQuery = (params?: { wardUnit?: string; status?: WardAdmissionStatus | "all" }) => {
  return useQuery({
    queryKey: ["wards", "admissions", params?.wardUnit ?? "all", params?.status ?? "all"],
    queryFn: () => getWardAdmissionsApi(params),
  });
};
