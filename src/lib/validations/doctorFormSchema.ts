import { z } from "zod";

export const doctorFormSchema = z.object({
  // 1. Personal Info
  fullName: z.string().min(3, "Full name is required"),
  dob: z.string().min(10, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  nationality: z.string().min(3, "Nationality is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(10, "Address is required"),
  emergencyContact: z.string().min(10, "Emergency contact is required"),

  // 2. Qualifications
  degree: z.string().min(3, "Degree is required"),
  specialization: z.string().min(3, "Specialization is required"),
  licenseNumber: z.string().min(3, "License number is required"),
  boardCertifications: z.string().optional(),
  additionalCertifications: z.string().optional(),
  medicalSchool: z.string().min(3, "Medical school is required"),
  graduationYear: z.string().min(4, "Graduation year is required"),

  // 3. Experience
  previousEmployer: z.string(),
  jobTitle: z.string(),
  duties: z.string(),
  references: z.string(),

  // 4. CME
  workshops: z.string().optional(),
  research: z.string().optional(),
  fellowships: z.string().optional(),

  // 5. Skills
  clinicalSkills: z.string(),
  surgicalExperience: z.string().optional(),
  equipment: z.string(),
  leadership: z.string().optional(),

  // 6. Health
  medicalHistory: z.string(),
  vaccination: z.string(),
  screening: z.string(),

  // 7. Legal
  validLicense: z.string(),
  backgroundCheck: z.string(),
  insurance: z.string(),

  // 8. Statement
  motivation: z.string(),
  careerGoals: z.string(),
  whyHospital: z.string(),

  // 9. Documents
  cv: z.any(),
  photo: z.any(),
  availability: z.string(),
});

export type DoctorFormValues = z.infer<typeof doctorFormSchema>;
