// types.ts

// Status a doctor can have
export type DoctorStatus = "active" | "assigned" | "suspended" | "sacked";

// Doctor interface
export interface Doctor {
  id: string;            // Unique identifier / UUID
  fullName: string;      // Doctor's full name
  imageUrl: string;      // URL for profile image
  specialty: string;     // Area of specialty (e.g., Cardiology)
  hospital: string;      // Hospital name
  status: DoctorStatus;  // Current status
}
