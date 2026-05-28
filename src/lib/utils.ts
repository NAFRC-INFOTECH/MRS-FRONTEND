import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function routeForRoleDepartment(role?: string, department?: string): string {
  const r = (role || "").toLowerCase();
  const d = (department || "").toLowerCase();
  if (r === "super_admin") return "/mrs-admin";
  if (r === "admin") return "/admin-dashboard";
  if (r === "doctor") return "/doctors-dashboard";
  if (r === "clinical") {
    if (d.includes("ear")) return "/clinical/ear";
    if (d.includes("eye")) return "/clinical/eye";
    return "/clinical";
  }
  if (r === "recording") return "/recordings";
  if (r === "radiology") return "/radiology";
  if (r === "staff" || r === "nurse") {
    const map: Record<string, string> = {
      gopd: "/gopd",
      lab: "/lab",
      antenatal: "/antenatal",
      ward: "/wards",
      childrenward: "/wards/children",
      femaleward: "/wards/female",
      maleward: "/wards/male",
      malevip: "/wards/male-vip",
      femalevip: "/wards/female-vip",
    };
    if (!d) return "/";
    return map[d] || `/${d}`;
  }
  return "/";
}
