// import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientsQuery, type Patient as PatientDoc } from "@/api-integration/queries/patients";
import { useMemo } from "react";

type PatientBasic = {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
};

type PatientProps = {
  patientBasic: PatientBasic;
};



export default function PatientProfileDetails({patientBasic}: PatientProps) {

  const { data: patients = [] } = usePatientsQuery();
  const resolved = useMemo<PatientBasic>(() => {
    const pid = (patientBasic as any)?.patientId || (patientBasic as any)?._id;
    const match = patients.find((p: PatientDoc) => String(p._id) === String(pid));
    if (match) {
      const fullName = [match.surname, match.firstname, match.middlename].filter(Boolean).join(" ");
      return {
        fullName: fullName || patientBasic.fullName,
        phone: match.phone || patientBasic.phone,
        dateOfBirth: match.dateOfBirth || patientBasic.dateOfBirth,
        gender: match.sex || patientBasic.gender,
      };
    }
    return patientBasic;
  }, [patients, patientBasic]);
  return (
    <Card className="w-full border-none">
      <CardHeader>
        <CardTitle>Patient Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-md">Full Name</span>
            <span className="text-sm font-medium">{resolved.fullName || "Nil"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-md">Phone</span>
            <span className="text-sm font-medium">{resolved.phone || "Nil"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-md">Date of Birth</span>
            <span className="text-sm font-medium">{resolved.dateOfBirth || "Nil"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-md">Gender</span>
            <span className="text-sm font-medium">{resolved.gender || "Nil"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
