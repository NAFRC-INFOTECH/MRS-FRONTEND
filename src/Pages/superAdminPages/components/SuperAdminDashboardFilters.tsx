import { Calendar, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DashboardPeriod } from './superAdminDashboardTypes';

interface SuperAdminDashboardFiltersProps {
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
  value: string;
  onValueChange: (value: string) => void;
}

export default function SuperAdminDashboardFilters({
  period,
  onPeriodChange,
  value,
  onValueChange,
}: SuperAdminDashboardFiltersProps) {
  const inputType = period === 'yearly' ? 'number' : period === 'monthly' ? 'month' : 'date';
  const placeholder = period === 'yearly' ? 'Select year' : period === 'monthly' ? 'Select month' : 'Select date';

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 text-gray-700">
        <Filter className="w-5 h-5 text-[#56bbe3]" />
        <span className="font-medium">Filter:</span>
      </div>
      
      <Select value={period} onValueChange={(v) => onPeriodChange(v as DashboardPeriod)}>
        <SelectTrigger className="w-full sm:w-40 border-gray-200 bg-gray-50">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-200">
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 w-full sm:w-56">
        <Calendar className="w-4 h-4 text-gray-500" />
        <Input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          min={period === 'yearly' ? 1900 : undefined}
          max={period === 'yearly' ? 2100 : undefined}
          className="border-gray-200 bg-gray-50"
        />
      </div>
    </div>
  );
}
