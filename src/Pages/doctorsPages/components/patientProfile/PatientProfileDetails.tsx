// import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientByIdQuery } from "@/api-integration/queries/patients";
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

  const pid = useMemo(() => {
    return String((patientBasic as any)?.patientId || (patientBasic as any)?._id || "");
  }, [patientBasic]);

  const patientQuery = usePatientByIdQuery(pid || undefined);
  const resolved = useMemo<PatientBasic>(() => {
    const match: any = patientQuery.data;
    if (!match) return patientBasic;
    const fullName = [match.surname, match.firstname, match.middlename].filter(Boolean).join(" ");
    return {
      fullName: fullName || patientBasic.fullName,
      phone: match.phone || patientBasic.phone,
      dateOfBirth: match.dateOfBirth || patientBasic.dateOfBirth,
      gender: match.sex || patientBasic.gender,
    };
  }, [patientBasic, patientQuery.data]);

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
