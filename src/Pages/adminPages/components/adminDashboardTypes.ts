export type DashboardPeriod = "daily" | "monthly" | "yearly";

export type DashboardRange = {
  period: DashboardPeriod;
  value: string;
  start: Date;
  end: Date;
};

export const getDefaultValueForPeriod = (period: DashboardPeriod) => {
  const now = new Date();
  if (period === "daily") return now.toISOString().slice(0, 10);
  if (period === "monthly") return now.toISOString().slice(0, 7);
  return String(now.getFullYear());
};

export const buildRange = (period: DashboardPeriod, value: string): DashboardRange => {
  const now = new Date();
  const v = (value || "").trim();

  if (period === "monthly") {
    const [yRaw, mRaw] = v ? v.split("-") : [];
    const y = Number(yRaw) || now.getFullYear();
    const m = Number(mRaw) || now.getMonth() + 1;
    const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const end = new Date(y, m, 1, 0, 0, 0, 0);
    return { period, value: `${y}-${String(m).padStart(2, "0")}`, start, end };
  }

  if (period === "yearly") {
    const y = Number(v) || now.getFullYear();
    const start = new Date(y, 0, 1, 0, 0, 0, 0);
    const end = new Date(y + 1, 0, 1, 0, 0, 0, 0);
    return { period, value: String(y), start, end };
  }

  const [yRaw, mRaw, dRaw] = v ? v.split("-") : [];
  const y = Number(yRaw) || now.getFullYear();
  const m = Number(mRaw) || now.getMonth() + 1;
  const d = Number(dRaw) || now.getDate();
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
  return { period, value: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, start, end };
};

export const toIsoDateOnly = (d: Date) => d.toISOString().slice(0, 10);

