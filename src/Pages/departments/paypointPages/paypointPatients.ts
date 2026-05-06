import type { PatientStatus } from "@/components/patientsTable/patientsDatas/types";

export type DeskFilter = "all" | "awaiting-clearance" | "completed";
export type BillingCategory = "all" | "civilian" | "personnel";

export type PaypointRow = {
  id: string;
  cardNumber: string;
  fullName: string;
  phone: string;
  rank: string;
  category: Exclude<BillingCategory, "all">;
  categoryLabel: string;
  billingLane: string;
  queueLabel: string;
  deskState: Exclude<DeskFilter, "all">;
  status: PatientStatus;
};

export function buildPaypointRows(patients: any[]): PaypointRow[] {
  return (patients as any[])
    .map((p) => {
      const id = String(p._id || p.personalInfo?.id || "");
      const status = ((p.patientStatus as PatientStatus | undefined) ||
        (p.personalInfo?.status as PatientStatus | undefined) ||
        "active") as PatientStatus;
      const queue = String(p.patientQueue || "").toLowerCase();
      const isPaypointPatient = queue === "paypoint" || status === "paypoint";

      if (!isPaypointPatient) return null;

      const veteran = !!p.veteran;
      const fullName =
        p.personalInfo?.fullName ||
        [p.surname, p.firstname, p.middlename].filter(Boolean).join(" ") ||
        "Unnamed Patient";

      const category: Exclude<BillingCategory, "all"> = veteran ? "personnel" : "civilian";

      return {
        id,
        cardNumber: veteran ? (p.serviceNumber || "") : (p.membershipNumber || ""),
        fullName,
        phone: p.personalInfo?.phone || p.phone || "",
        rank: veteran ? (p.rank || "") : "",
        category,
        categoryLabel: veteran ? "Personnel / Veteran" : "Civilian",
        billingLane: veteran ? "Service Billing Desk" : "Civilian Billing Desk",
        queueLabel: queue === "paypoint" ? "Paypoint Queue" : "Transferred to Paypoint",
        deskState: status === "paypoint" ? "awaiting-clearance" : "completed",
        status,
      };
    })
    .filter((row): row is PaypointRow => Boolean(row));
}

export function summarizePaypointRows(rows: PaypointRow[]) {
  return {
    total: rows.length,
    awaiting: rows.filter((row) => row.deskState === "awaiting-clearance").length,
    completed: rows.filter((row) => row.deskState === "completed").length,
    personnel: rows.filter((row) => row.category === "personnel").length,
    civilian: rows.filter((row) => row.category === "civilian").length,
  };
}
