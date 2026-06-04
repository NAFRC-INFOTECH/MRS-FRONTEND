import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TimePeriodFilter, WardStatusFilter, WardUnitFilter } from "./wardPatientsTypes";
import { wardUnitLabel } from "./wardPatientsTypes";

export default function WardPatientsFilters({
  wardUnit,
  onWardUnitChange,
  status,
  onStatusChange,
  period,
  onPeriodChange,
  periodValue,
  onPeriodValueChange,
  search,
  onSearchChange,
}: {
  wardUnit: WardUnitFilter;
  onWardUnitChange: (v: WardUnitFilter) => void;
  status: WardStatusFilter;
  onStatusChange: (v: WardStatusFilter) => void;
  period: TimePeriodFilter;
  onPeriodChange: (v: TimePeriodFilter) => void;
  periodValue: string;
  onPeriodValueChange: (v: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
}) {
  const inputType = period === "daily" ? "date" : period === "monthly" ? "month" : "number";
  const placeholder = period === "daily" ? "Select date" : period === "monthly" ? "Select month" : "Year";

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
      <Select value={wardUnit} onValueChange={(v) => onWardUnitChange(v as WardUnitFilter)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Ward Unit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Wards</SelectItem>
          {Object.entries(wardUnitLabel).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => onStatusChange(v as WardStatusFilter)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Admission Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="admitted">Admitted</SelectItem>
          <SelectItem value="discharged">Discharged</SelectItem>
        </SelectContent>
      </Select>

      <Select value={period} onValueChange={(v) => onPeriodChange(v as TimePeriodFilter)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type={inputType}
        placeholder={placeholder}
        value={periodValue}
        onChange={(e) => onPeriodValueChange(e.target.value)}
        min={period === "yearly" ? 1900 : undefined}
        max={period === "yearly" ? 2100 : undefined}
      />

      <Input
        placeholder="Search by patient name"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="lg:col-span-2"
      />
    </div>
  );
}

