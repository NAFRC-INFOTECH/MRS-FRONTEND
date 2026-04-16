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
  if (r === "recording") return "/recordings";
  if (r === "nurse") {
    const map: Record<string, string> = {
      gopd: "/gopd",
      lab: "/lab",
    };
    if (!d) return "/";
    return map[d] || `/${d}`;
  }
  return "/";
}
