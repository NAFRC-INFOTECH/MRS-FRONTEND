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

export default function MultiStepDoctorForm() {
  const [step, setStep] = useState(0);

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

  const submit = form.handleSubmit((data) => {
    console.log("FINAL DATA:", data);
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
