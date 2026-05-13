import type { PatientStatus } from "@/components/patientsTable/patientsDatas/types";

export type DeskFilter = "all" | "awaiting-dispense" | "completed";
export type CoverageCategory = "all" | "civilian" | "personnel";

export type PharmacyRow = {
  id: string;
  cardNumber: string;
  fullName: string;
  phone: string;
  rank: string;
  category: Exclude<CoverageCategory, "all">;
  categoryLabel: string;
  queueLabel: string;
  deskState: Exclude<DeskFilter, "all">;
  status: PatientStatus;
};

export function buildPharmacyRows(patients: any[]): PharmacyRow[] {
  return (patients as any[])
    .map((p) => {
      const id = String(p.id || p._id || p.personalInfo?.id || "");
      const status = ((p.patientStatus as PatientStatus | undefined) ||
        (p.personalInfo?.status as PatientStatus | undefined) ||
        "active") as PatientStatus;
      const queue = String(p.patientQueue || "").toLowerCase();
      const deskStateFromData = String(p.deskState || "").toLowerCase();
      const isPharmacyPatient = queue === "pharmacy" || (status as any) === "pharmacy" || deskStateFromData === "awaiting-dispense" || deskStateFromData === "completed";

      if (!isPharmacyPatient) return null;

      const veteran = !!p.veteran;
      const fullName =
        p.personalInfo?.fullName ||
        [p.surname, p.firstname, p.middlename].filter(Boolean).join(" ") ||
        "Unnamed Patient";

      const category: Exclude<CoverageCategory, "all"> = veteran ? "personnel" : "civilian";
      const deskState = deskStateFromData === "completed" ? "completed" : "awaiting-dispense";

      return {
        id,
        cardNumber: p.membershipNumber || p.serviceNumber || "",
        fullName,
        phone: p.personalInfo?.phone || p.phone || "",
        rank: veteran ? (p.rank || "") : "",
        category,
        categoryLabel: veteran ? "Personnel / Veteran" : "Civilian / Dependent",
        queueLabel: queue === "pharmacy" ? "Pharmacy Queue" : "Transferred to Pharmacy",
        deskState,
        status,
      };
    })
    .filter((row): row is PharmacyRow => Boolean(row));
}

export function summarizePharmacyRows(rows: PharmacyRow[]) {
  return {
    total: rows.length,
    awaiting: rows.filter((row) => row.deskState === "awaiting-dispense").length,
    completed: rows.filter((row) => row.deskState === "completed").length,
    personnel: rows.filter((row) => row.category === "personnel").length,
    civilian: rows.filter((row) => row.category === "civilian").length,
  };
}
