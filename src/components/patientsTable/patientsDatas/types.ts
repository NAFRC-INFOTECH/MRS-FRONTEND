// Patient status type
export type PatientStatus = "active" | "inactive" | "discharged";

// Condition type
export type PatientCondition = "on medication" | "on sick bed" | "discharged" | "recovered";


export type Patient = {
  personalInfo: {
    id: string;
    fullName: string;
    imageUrl: string;
    phone: string;
    email: string;
    address: string;
    status: PatientStatus;
    condition: PatientCondition;
  };
};