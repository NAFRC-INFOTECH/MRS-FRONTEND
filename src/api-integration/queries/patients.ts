import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type DrugItem = {
  name: string;
  dosage: string;
  quantity: number;
  instructions?: string;
};

export type Patient = {
  _id: string;
  surname: string;
  firstname: string;
  middlename: string;
  veteran?: boolean;
  serviceNumber?: string;
  rank?: string;
  membershipNumber?: string;
  sex?: string;
  age?: number;
  dateOfBirth?: string;
  country?: string;
  stateOfOrigin?: string;
  lga?: string;
  address?: string;
  religion?: string;
  maritalStatus?: string;
  phone?: string;
  occupation?: string;
  genotype?: string;
  bloodGroup?: string;
  patientStatus?: string;
  patientQueue?: string;
  nok?: { name?: string; relationship?: string; phone?: string; address?: string };
};

export type PharmacyPatient = Patient & {
  deskState: string;
  prescription?: string;
  drugs?: DrugItem[];
};

export const getPatientsApi = async (q?: string): Promise<Patient[]> => {
  const res = await api.get("/patients", { params: q ? { q } : undefined });
  return res.data as Patient[];
};

export const getPaypointReferredPatientsApi = async (q?: string): Promise<Patient[]> => {
  const res = await api.get("/patients/paypoint/referred", { params: q ? { q } : undefined });
  return res.data as Patient[];
};

export const getNHIAReferredPatientsApi = async (q?: string): Promise<Patient[]> => {
  const res = await api.get("/patients/nhia/referred", { params: q ? { q } : undefined });
  return res.data as Patient[];
};

export const getPatientByIdApi = async (id: string): Promise<Patient> => {
  const res = await api.get(`/patients/${encodeURIComponent(id)}`);
  return res.data as Patient;
};

export const usePatientsQuery = (q?: string) => {
  return useQuery({
    queryKey: ["patients", q ?? ""],
    queryFn: () => getPatientsApi(q),
  });
};

export const usePaypointReferredPatientsQuery = (q?: string) => {
  return useQuery({
    queryKey: ["patients", "paypoint", q ?? ""],
    queryFn: () => getPaypointReferredPatientsApi(q),
  });
};

export const useNHIAReferredPatientsQuery = (q?: string) => {
  return useQuery({
    queryKey: ["patients", "nhia", q ?? ""],
    queryFn: () => getNHIAReferredPatientsApi(q),
  });
};

export const getPharmacyReferredPatientsApi = async (q?: string): Promise<PharmacyPatient[]> => {
  const res = await api.get("/patients/pharmacy/referred", { params: q ? { q } : undefined });
  return res.data as PharmacyPatient[];
};

export const addPatientToPharmacyApi = async (patientId: string, data?: { prescription?: string; drugs?: DrugItem[] }): Promise<any> => {
  const res = await api.post("/patients/pharmacy/add", { patientId, ...data });
  return res.data;
};

export const updatePharmacyDeskStateApi = async (patientId: string, deskState: string, data?: { prescription?: string; drugs?: DrugItem[] }): Promise<any> => {
  const res = await api.patch(`/patients/pharmacy/${encodeURIComponent(patientId)}/desk-state`, { deskState, ...data });
  return res.data;
};

export const usePharmacyReferredPatientsQuery = (q?: string) => {
  return useQuery({
    queryKey: ["patients", "pharmacy", q ?? ""],
    queryFn: () => getPharmacyReferredPatientsApi(q),
  });
};
