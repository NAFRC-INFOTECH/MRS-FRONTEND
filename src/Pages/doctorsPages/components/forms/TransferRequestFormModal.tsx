import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPatientByIdApi, type Patient } from "@/api-integration/queries/patients";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateLabReferralMutation } from "@/api-integration/mutations/labReferrals";

export default function TransferRequestFormModal({
  open,
  onOpenChange,
  patientId,
  destination,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  patientId: string | null;
  destination: "lab" | "xray" | null;
  onSubmitted: (dest: "lab" | "xray") => void;
}) {
  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientByIdApi(patientId || ""),
    enabled: !!patientId && open,
  });
  const createReferral = useCreateLabReferralMutation();

  const computeAgeFromDob = (dob?: string) => {
    if (!dob) return "";
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return String(age);
  };

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    serviceNoOrUUID: "",
    rank: "",
    forenames: "",
    surname: "",
    wardNo: "",
    hospitalUnit: "",
    age: "",
    to: "",
    specimen: "",
    examinationRequired: "",
    diagnosis: "",
    statement: "",
    previousReportNos: "",
    previousReportDate: "",
  });

  useEffect(() => {
    if (patient) {
      const p = patient as Patient;
      setForm((prev) => ({
        ...prev,
        serviceNoOrUUID: p.serviceNumber || p.membershipNumber || p._id,
        rank: p.rank || "",
        forenames: [p.firstname, p.middlename].filter(Boolean).join(" "),
        surname: p.surname || "",
        age: p.age ? String(p.age) : computeAgeFromDob(p.dateOfBirth),
        to: destination ? (destination === "lab" ? "Lab" : "X-ray") : prev.to,
      }));
    }
  }, [patient, destination]);

  const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async () => {
    if (!destination) return;
    await createReferral.mutateAsync({
      patientId,
      date: form.date,
      serviceNoOrUUID: form.serviceNoOrUUID,
      rank: form.rank,
      forenames: form.forenames,
      surname: form.surname,
      wardNo: form.wardNo,
      hospitalUnit: form.hospitalUnit,
      age: form.age,
      to: form.to,
      specimen: form.specimen,
      examinationRequired: form.examinationRequired,
      diagnosis: form.diagnosis,
      statement: form.statement,
      previousReportNos: form.previousReportNos,
      previousReportDate: form.previousReportDate,
    }).catch(() => void 0);
    onOpenChange(false);
    onSubmitted(destination);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-auto mt-15">
        <DialogHeader className="text-3xl">
          <DialogTitle>{destination === "lab" ? "Laboratory Request Form" : "X-ray Request Form"}</DialogTitle>
          <DialogDescription>Fill out the request details. Prefilled fields come from the patient profile.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {isLoading && <div className="text-sm text-gray-500">Loading patient details…</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Date</label>
              <Input type="date" value={form.date} onChange={onChange("date")} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Service No / UUID</label>
              <Input value={form.serviceNoOrUUID} onChange={onChange("serviceNoOrUUID")} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Rank / Rating</label>
              <Input value={form.rank} onChange={onChange("rank")} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Forename(s)</label>
              <Input value={form.forenames} onChange={onChange("forenames")} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Surname</label>
              <Input value={form.surname} onChange={onChange("surname")} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Ward No (if admitted)</label>
              <Input value={form.wardNo} onChange={onChange("wardNo")} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Hospital / Ship Unit</label>
              <Input value={form.hospitalUnit} onChange={onChange("hospitalUnit")} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Age</label>
              <Input value={form.age} onChange={onChange("age")} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">To</label>
              <Input value={form.to} onChange={onChange("to")} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">{destination === "lab" ? "Laboratory Specimen" : "Imaging Area"}</label>
              <Input value={form.specimen} onChange={onChange("specimen")} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600">Examination Required</label>
            <Input value={form.examinationRequired} onChange={onChange("examinationRequired")} />
          </div>
          <div>
            <label className="text-xs text-gray-600">Diagnosis</label>
            <Input value={form.diagnosis} onChange={onChange("diagnosis")} />
          </div>
          <div>
            <label className="text-xs text-gray-600">Short Statement (Case Inc.)</label>
            <Textarea rows={3} value={form.statement} onChange={onChange("statement")} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Previous Report Nos</label>
              <Input value={form.previousReportNos} onChange={onChange("previousReportNos")} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Previous Report Date</label>
              <Input type="date" value={form.previousReportDate} onChange={onChange("previousReportDate")} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit} className="bg-[#56bbe3] text-white">Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
