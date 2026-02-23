import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { doctorFormSchema, DoctorFormValues } from "@/lib/doctorFormSchema";

import Step1PersonalInfo from "./hire-doctor-steps/Step1PersonalInfo";
import Step2Qualifications from "./hire-doctor-steps/Step2Qualifications";
import Step3Experience from "./hire-doctor-steps/Step3Experience";
import Step4CME from "./hire-doctor-steps/Step4CME";
import Step5Skills from "./hire-doctor-steps/Step5Skills";
import Step6Health from "./hire-doctor-steps/Step6Health";
import Step7Legal from "./hire-doctor-steps/Step7Legal";
import Step8Statement from "./hire-doctor-steps/Step8Statement";
import Step9Documents from "./hire-doctor-steps/Step9Documents";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { doctorFormSchema, type DoctorFormValues } from "@/lib/validations/doctorFormSchema";
import { useDoctorProfileUpdateMutation, useCompleteOnboardingMutation } from "@/api-integration/mutations/doctorProfiles";
import { toast } from "sonner";

export default function MultiStepDoctorForm() {
  const [step, setStep] = useState(0);
  const updateProfile = useDoctorProfileUpdateMutation();
  const completeOnboarding = useCompleteOnboardingMutation();

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      dob: "",
      gender: "",
      nationality: "",
      phone: "",
      email: "",
      address: "",
      emergencyContact: "",
      degree: "",
      specialization: "",
      licenseNumber: "",
      boardCertifications: "",
      additionalCertifications: "",
      medicalSchool: "",
      graduationYear: "",
      previousEmployer: "",
      jobTitle: "",
      duties: "",
      references: "",
      workshops: "",
      research: "",
      fellowships: "",
      clinicalSkills: "",
      surgicalExperience: "",
      equipment: "",
      leadership: "",
      medicalHistory: "",
      vaccination: "",
      screening: "",
      validLicense: "",
      backgroundCheck: "",
      insurance: "",
      motivation: "",
      careerGoals: "",
      whyHospital: "",
      cv: undefined as any,
      photo: undefined as any,
      availability: "",
    }
  });

  const steps = [
    Step1PersonalInfo,
    Step2Qualifications,
    Step3Experience,
    Step4CME,
    Step5Skills,
    Step6Health,
    Step7Legal,
    Step8Statement,
    Step9Documents,
  ];

  const CurrentStep = steps[step];

  const next = async () => {
    const fieldsPerStep: (keyof DoctorFormValues)[][] = [
      ["fullName","dob","gender","nationality","phone","email","address","emergencyContact"],
      ["degree","specialization","licenseNumber","boardCertifications","additionalCertifications","medicalSchool","graduationYear"],
      ["previousEmployer","jobTitle","duties","references"],
      ["workshops","research","fellowships"],
      ["clinicalSkills","surgicalExperience","equipment","leadership"],
      ["medicalHistory","vaccination","screening"],
      ["validLicense","backgroundCheck","insurance"],
      ["motivation","careerGoals","whyHospital"],
      ["cv","photo","availability"],
    ];
    const valid = await form.trigger(fieldsPerStep[step]);
    if (!valid) return;
    setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => s - 1);

  const submit = form.handleSubmit(async (data) => {
    const patch = {
      personalInfo: {
        fullName: data.fullName,
        dateOfBirth: data.dob,
        gender: data.gender,
        nationality: data.nationality,
        phone: data.phone,
        email: data.email,
        address: data.address,
        emergencyContact: data.emergencyContact,
      },
      qualifications: {
        medicalDegree: data.degree,
        specialization: data.specialization,
        licenses: data.licenseNumber,
        boardCertifications: data.boardCertifications,
        additionalCertifications: data.additionalCertifications,
        medicalSchool: data.medicalSchool,
        graduationYear: data.graduationYear,
      },
      experience: {
        employers: data.previousEmployer,
        jobTitles: data.jobTitle,
        responsibilities: data.duties,
        references: data.references,
      },
      cme: {
        workshops: data.workshops,
        research: data.research,
        fellowships: data.fellowships,
      },
      skills: {
        clinicalSkills: data.clinicalSkills,
        surgicalExperience: data.surgicalExperience,
        equipment: data.equipment,
        leadership: data.leadership,
      },
      health: {
        medicalHistory: data.medicalHistory,
        vaccinations: data.vaccination,
        screenings: data.screening,
      },
      legal: {
        licenseProof: data.validLicense,
        backgroundCheck: data.backgroundCheck,
        insurance: data.insurance,
      },
      statement: {
        motivation: data.motivation,
        careerGoals: data.careerGoals,
        hospitalReason: data.whyHospital,
      },
      documents: {
        cv: typeof data.cv === "string" ? data.cv : "",
        photo: typeof data.photo === "string" ? data.photo : "",
        availability: data.availability,
      },
    } as const;
    try {
      await updateProfile.mutateAsync(patch as any);
      await completeOnboarding.mutateAsync();
      toast.success("Onboarding completed. Your account is now a Doctor.");
    } catch {
      toast.error("Failed to submit doctor onboarding");
    }
  });

  return (
    <Form {...form}>
      <div className="flex items-center justify-center">
        <form className="max-w-3xl w-full mx-2 shadow-md md:mt-20 space-y-6 border border-black/20 px-4 py-6 rounded-xl" onSubmit={submit}>
            <CurrentStep form={form} />

            <div className="flex justify-between">
            {step > 0 && (
                <Button type="button" variant="outline" onClick={prev}>
                Back
                </Button>
            )}

            {step < steps.length - 1 ? (
                <Button type="button" onClick={next}>Next</Button>
            ) : (
                <Button type="submit">Submit Doctor</Button>
            )}
            </div>
        </form>
      </div>
    </Form>
  );
}
