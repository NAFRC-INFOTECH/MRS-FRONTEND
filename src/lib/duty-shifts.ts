export type FrontendDutyShift = "MORNING" | "AFTERNOON" | "NIGHT";

const nextDayStr = (date: string) => {
  const dt = new Date(date);
  dt.setDate(dt.getDate() + 1);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const DUTY_SHIFT_OPTIONS: Array<{ value: FrontendDutyShift; label: string }> = [
  { value: "MORNING", label: "Morning" },
  { value: "AFTERNOON", label: "Afternoon" },
  { value: "NIGHT", label: "Night" },
];

export const getShiftTimes = (date: string, shift: string) => {
  if (!date || !shift) return { timeIn: "", timeOut: "" };

  if (shift === "MORNING") {
    return { timeIn: `${date}T08:00`, timeOut: `${date}T14:00` };
  }

  if (shift === "AFTERNOON") {
    return { timeIn: `${date}T14:00`, timeOut: `${date}T21:00` };
  }

  if (shift === "NIGHT") {
    return { timeIn: `${date}T21:00`, timeOut: `${nextDayStr(date)}T07:59` };
  }

  return { timeIn: "", timeOut: "" };
};
