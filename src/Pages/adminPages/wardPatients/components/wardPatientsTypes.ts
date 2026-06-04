export type WardUnitFilter = "all" | "MaleWard" | "FemaleWard" | "ChildrenWard" | "MaleVIP" | "FemaleVIP";

export type WardStatusFilter = "all" | "admitted" | "discharged";

export type TimePeriodFilter = "daily" | "monthly" | "yearly";

export const wardUnitLabel: Record<Exclude<WardUnitFilter, "all">, string> = {
  MaleWard: "Male Ward",
  FemaleWard: "Female Ward",
  ChildrenWard: "Children Ward",
  MaleVIP: "Male VIP Ward",
  FemaleVIP: "Female VIP Ward",
};

