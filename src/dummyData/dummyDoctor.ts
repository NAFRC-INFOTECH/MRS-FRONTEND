// import type { doctorProfile } from "@/types/doctorProfile";

import type { doctorProfile } from "@/api-integration/types/doctorProfile";

export const dummyDoctors: doctorProfile[] = [
  {
    personalInfo: {
      id: "SP-1001",
      fullName: "Dr. Sarah Johnson",
      dateOfBirth: "1985-04-12",
      gender: "Female",
      nationality: "Nigerian",
      state: "Lagos",
      phone: "+2348012345678",
      email: "sarah.johnson@example.com",
      address: "12 Admiralty Way, Lekki, Lagos",
      idDocument: "Passport - A12345678",
      emergencyContact: "Michael Johnson (+2348098765432)",
      imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600",
      hospital: "City Hospital",
      status: "assigned",
    },
    qualifications: {
      medicalDegree: "MBBS",
      specialization: "Cardiologist",
      licenses: "Medical and Dental Council of Nigeria (MDCN)",
      boardCertifications: "West African College of Physicians",
      additionalCertifications: "ACLS, CPR",
      medicalSchool: "University of Lagos",
      graduationYear: "2009",
    },
    experience: {
      employers: "LUTH (2015–2022)",
      jobTitles: "Senior Registrar",
      responsibilities: "Patient diagnosis, cardiac procedures",
      references: "Dr. Adeyemi – Chief Cardiologist",
      specializedExperience: "Interventional cardiology",
    },
    cme: {
      workshops: "Annual Cardiology Summit 2023",
      research: "Hypertension management (2022)",
      fellowships: "Cardiology Fellowship – UK",
    },
    skills: {
      clinicalSkills: "Diagnostics, treatment planning",
      surgicalExperience: "Minor cardiac procedures",
      equipment: "ECG, MRI",
      leadership: "Team lead",
    },
    health: {
      medicalHistory: "Fit to practice",
      vaccinations: "Hepatitis B, COVID-19",
      screenings: "TB cleared",
    },
    legal: {
      licenseProof: "Verified MDCN License",
      backgroundCheck: "Cleared",
      insurance: "Malpractice insured",
    },
    statement: {
      motivation: "Improve cardiac healthcare",
      careerGoals: "Lead cardiology department",
      hospitalReason: "Advanced cardiac unit",
    },
    documents: {
      cv: "sarah_johnson_cv.pdf",
      photo: "sarah_johnson.jpg",
      contract: "signed_contract.pdf",
      availability: "1 month notice",
    },
  }
];
