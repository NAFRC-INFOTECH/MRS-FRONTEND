import { useParams, useNavigate } from "react-router-dom";
import { useDoctorProfileByIdQuery } from "@/api-integration/queries/doctors";

// SectionCard & Field components
const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-base font-medium text-gray-800">{value || "NIL"}</span>
  </div>
);

export default function DoctorProfile() {
  const { id } = useParams(); // get doctor id from route
  const navigate = useNavigate();

  const { data, isLoading, isError } = useDoctorProfileByIdQuery(id || "", !!id);

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Loading doctor…</h1>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Doctor not found</h1>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="pb-6 space-y-4 md:space-y-8 min-h-screen">
      {/* Optional: Doctor name at the top */}
      <h1 className="text-3xl font-bold text-gray-900">{data.personalInfo.fullName}</h1>

      {/* Personal Info */}
      <SectionCard title="Personal Information">
        <div className="md:flex items-start gap-9 w-full">
          <div className="flex items-center justify-center w-full md:w-[15rem] !h-full min-h-[13rem] bg-red-100">
            <img src={data.personalInfo.imageUrl} alt={data.personalInfo.fullName} className="w-full h-[13rem] bg-cover" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 w-full pt-4 md:pt-0">
            <Field label="Full Name" value={data.personalInfo.fullName} />
            <Field label="Date of Birth" value={data.personalInfo.dateOfBirth} />
            <Field label="Gender" value={data.personalInfo.gender} />
            <Field label="Nationality" value={data.personalInfo.nationality} />
            <Field label="State" value={data.personalInfo.state} />
            <Field label="Phone" value={data.personalInfo.phone} />
            <Field label="Email" value={data.personalInfo.email} />
            <Field label="Address" value={data.personalInfo.address} />
            <Field label="ID Document" value={data.personalInfo.idDocument} />
            <Field label="Emergency Contact" value={data.personalInfo.emergencyContact} />
          </div>
        </div>
      </SectionCard>

      {/* Qualifications */}
      <SectionCard title="Professional Qualifications">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Field label="Medical Degree" value={data.qualifications.medicalDegree} />
          <Field label="Specialization" value={data.qualifications.specialization} />
          <Field label="Licenses" value={data.qualifications.licenses} />
          <Field label="Board Certifications" value={data.qualifications.boardCertifications} />
          <Field label="Additional Certifications" value={data.qualifications.additionalCertifications} />
          <Field label="Medical School" value={data.qualifications.medicalSchool} />
          <Field label="Graduation Year" value={data.qualifications.graduationYear} />
        </div>
      </SectionCard>

      {/* Work Experience */}
      <SectionCard title="Work Experience">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Previous Employers" value={data.experience.employers} />
          <Field label="Job Titles" value={data.experience.jobTitles} />
          <Field label="Responsibilities" value={data.experience.responsibilities} />
          <Field label="References" value={data.experience.references} />
          <Field label="Specialized Experience" value={data.experience.specializedExperience} />
        </div>
      </SectionCard>

      {/* CME */}
      <SectionCard title="Continuing Medical Education">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Workshops / Conferences" value={data.cme.workshops} />
          <Field label="Research & Publications" value={data.cme.research} />
          <Field label="Fellowships / Training" value={data.cme.fellowships} />
        </div>
      </SectionCard>

      {/* Skills */}
      <SectionCard title="Skills & Competencies">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Clinical Skills" value={data.skills.clinicalSkills} />
          <Field label="Surgical Experience" value={data.skills.surgicalExperience} />
          <Field label="Equipment Proficiency" value={data.skills.equipment} />
          <Field label="Leadership" value={data.skills.leadership} />
        </div>
      </SectionCard>

      {/* Health */}
      <SectionCard title="Health & Wellness">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Medical History" value={data.health.medicalHistory} />
          <Field label="Vaccinations" value={data.health.vaccinations} />
          <Field label="Health Screenings" value={data.health.screenings} />
        </div>
      </SectionCard>

      {/* Legal */}
      <SectionCard title="Legal & Regulatory Compliance">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="License Proof" value={data.legal.licenseProof} />
          <Field label="Background Check" value={data.legal.backgroundCheck} />
          <Field label="Insurance" value={data.legal.insurance} />
        </div>
      </SectionCard>

      {/* Statement */}
      <SectionCard title="Personal Statement">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Motivation" value={data.statement.motivation} />
          <Field label="Career Goals" value={data.statement.careerGoals} />
          <Field label="Why this hospital?" value={data.statement.hospitalReason} />
        </div>
      </SectionCard>

      {/* Documents */}
      <SectionCard title="Other Documentation">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="CV" value={data.documents.cv} />
          <Field label="Photo" value={data.documents.photo} />
          <Field label="Employment Contract" value={data.documents.contract} />
          <Field label="Availability" value={data.documents.availability} />
        </div>
      </SectionCard>
    </div>
  );
}
