export type DashboardPeriod = 'daily' | 'monthly' | 'yearly';

export interface DashboardRange {
  start: Date;
  end: Date;
  period: DashboardPeriod;
  value: string;
}

export const buildRange = (period: DashboardPeriod, value: string): DashboardRange => {
  const now = new Date();
  
  if (period === 'daily') {
    const date = value ? new Date(value) : new Date();
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
    return {
      start,
      end,
      period,
      value: toIsoDateOnly(start)
    };
  }
  
  if (period === 'monthly') {
    if (!value) {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
      return {
        start,
        end,
        period,
        value: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`
      };
    }
    const [year, month] = value.split('-').map(Number);
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 1, 0, 0, 0, 0);
    return { start, end, period, value };
  }
  
  // Yearly
  const year = value ? Number(value) : now.getFullYear();
  const start = new Date(year, 0, 1, 0, 0, 0, 0);
  const end = new Date(year + 1, 0, 1, 0, 0, 0, 0);
  return { start, end, period, value: String(year) };
};

export const getDefaultValueForPeriod = (period: DashboardPeriod): string => {
  const now = new Date();
  if (period === 'daily') {
    return toIsoDateOnly(now);
  }
  if (period === 'monthly') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  return String(now.getFullYear());
};

export const toIsoDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
