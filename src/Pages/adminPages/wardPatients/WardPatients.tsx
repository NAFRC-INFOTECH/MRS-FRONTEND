import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WardPatientsFilters from "./components/WardPatientsFilters";
import WardPatientsTable from "./components/WardPatientsTable";
import type { TimePeriodFilter, WardStatusFilter, WardUnitFilter } from "./components/wardPatientsTypes";

export default function WardPatients() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [wardUnit, setWardUnit] = useState<WardUnitFilter>("all");
  const [status, setStatus] = useState<WardStatusFilter>("admitted");
  const [period, setPeriod] = useState<TimePeriodFilter>("daily");
  const [periodValue, setPeriodValue] = useState<string>(today);
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Ward Patients</h1>
        <p className="text-sm text-muted-foreground">
          Filter admitted/discharged ward patients, search by name, and update medication orders when patients stay longer.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter by ward unit, admission status, and daily/monthly/yearly admitted date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WardPatientsFilters
            wardUnit={wardUnit}
            onWardUnitChange={setWardUnit}
            status={status}
            onStatusChange={setStatus}
            period={period}
            onPeriodChange={(p) => {
              setPeriod(p);
              const now = new Date();
              if (p === "daily") setPeriodValue(now.toISOString().slice(0, 10));
              else if (p === "monthly") setPeriodValue(now.toISOString().slice(0, 7));
              else setPeriodValue(String(now.getFullYear()));
            }}
            periodValue={periodValue}
            onPeriodValueChange={setPeriodValue}
            search={search}
            onSearchChange={setSearch}
          />
        </CardContent>
      </Card>

      <WardPatientsTable wardUnit={wardUnit} status={status} period={period} periodValue={periodValue} search={search} />
    </div>
  );
}
