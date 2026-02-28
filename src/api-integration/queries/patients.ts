import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export type Patient = {
  _id: string;
  surname: string;
  firstname: string;
  lastname: string;
  veteran?: boolean;
  serviceNumber?: string;
  rank?: string;
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
  nok?: { name?: string; relationship?: string; phone?: string; address?: string };
};

export const getPatientsApi = async (q?: string): Promise<Patient[]> => {
  const res = await api.get("/patients", { params: q ? { q } : undefined });
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
