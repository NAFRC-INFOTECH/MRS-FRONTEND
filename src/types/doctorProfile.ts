export type doctorProfile = {
    personalInfo: {
    id: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    phone: string;
    email: string;
    address: string;
    idDocument: string;
    emergencyContact: string;
    imageUrl: string;
    hospital: string;
    status: string;
  };
  qualifications: {
    medicalDegree: string;
    specialization: string;
    licenses: string;
    boardCertifications: string;
    additionalCertifications: string;
    medicalSchool: string;
    graduationYear: string;
  };
  experience: {
    employers: string;
    jobTitles: string;
    responsibilities: string;
    references: string;
    specializedExperience: string;
  };
  cme: {
    workshops: string;
    research: string;
    fellowships: string;
  };
  skills: {
    clinicalSkills: string;
    surgicalExperience: string;
    equipment: string;
    leadership: string;
  };
  health: {
    medicalHistory: string;
    vaccinations: string;
    screenings: string;
  };
  legal: {
    licenseProof: string;
    backgroundCheck: string;
    insurance: string;
  };
  statement: {
    motivation: string;
    careerGoals: string;
    hospitalReason: string;
  };
  documents: {
    cv: string;
    photo: string;
    contract: string;
    availability: string;
  };
};