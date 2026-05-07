import type { PatientStatus } from "@/components/patientsTable/patientsDatas/types";

export type DeskFilter = "all" | "awaiting-clearance" | "completed";
export type CoverageCategory = "all" | "civilian" | "personnel";

export type NHIARow = {
  id: string;
  cardNumber: string;
  fullName: string;
  phone: string;
  rank: string;
  category: Exclude<CoverageCategory, "all">;
  categoryLabel: string;
  coverageLane: string;
  queueLabel: string;
  deskState: Exclude<DeskFilter, "all">;
  status: PatientStatus;
};

export function buildNHIARows(patients: any[]): NHIARow[] {
  return (patients as any[])
    .map((p) => {
      const id = String(p._id || p.personalInfo?.id || "");
      const status = ((p.patientStatus as PatientStatus | undefined) ||
        (p.personalInfo?.status as PatientStatus | undefined) ||
        "active") as PatientStatus;
      const queue = String(p.patientQueue || "").toLowerCase();
      const isNHIAPatient = queue === "nhia" || status === "nhia";

      if (!isNHIAPatient) return null;

      const veteran = !!p.veteran;
      const fullName =
        p.personalInfo?.fullName ||
        [p.surname, p.firstname, p.middlename].filter(Boolean).join(" ") ||
        "Unnamed Patient";

      const category: Exclude<CoverageCategory, "all"> = veteran ? "personnel" : "civilian";

      return {
        id,
        cardNumber: p.membershipNumber || p.serviceNumber || "",
        fullName,
        phone: p.personalInfo?.phone || p.phone || "",
        rank: veteran ? (p.rank || "") : "",
        category,
        categoryLabel: veteran ? "Personnel / Veteran" : "Civilian / Dependent",
        coverageLane: veteran ? "Military NHIA Desk" : "Civilian NHIA Desk",
        queueLabel: queue === "nhia" ? "NHIA Queue" : "Transferred to NHIA",
        deskState: status === "nhia" ? "awaiting-clearance" : "completed",
        status,
      };
    })
    .filter((row): row is NHIARow => Boolean(row));
}

export function summarizeNHIARows(rows: NHIARow[]) {
  return {
    total: rows.length,
    awaiting: rows.filter((row) => row.deskState === "awaiting-clearance").length,
    completed: rows.filter((row) => row.deskState === "completed").length,
    personnel: rows.filter((row) => row.category === "personnel").length,
    civilian: rows.filter((row) => row.category === "civilian").length,
  };
}
