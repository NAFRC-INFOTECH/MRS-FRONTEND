import { useParams, useNavigate } from "react-router-dom";
import { useVitalsQuery } from "@/api-integration/queries/vitals";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildPatientData } from "./petientsMedHistory/patientDataAdapter";
import { useDoctorDayListQuery } from "@/api-integration/queries/doctorDayList";
import RecentVitalSign from "./petientsMedHistory/recentVitalSigns/RecentVitalSign";
import BloodPressureChart from "./petientsMedHistory/charts/BloodPressureChart";
import type { MonthlyData } from "./types/patientstypes";
import PatientProfileDetails from "./components/patientProfile/PatientProfileDetails";
import DoctorReport from "./components/doctorReport/DoctorReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PatientMedicalHistory() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { data: vitals = [] } = useVitalsQuery(patientId);
  const { data: daylist = [] } = useDoctorDayListQuery();
  const patientBasic = useMemo(() => (daylist as any[]).find((d) => String(d.patientId) === String(patientId)) || {}, [daylist, patientId]);
  const structured = useMemo(() => buildPatientData(patientBasic, vitals as any[]), [patientBasic, vitals]);
  const years = useMemo(() => (structured.yearly_data || []).map((y) => y.year), [structured]);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [year, setYear] = useState<number>(currentYear);
  useEffect(() => {
    if (!years.length) return;
    if (years.includes(currentYear)) setYear(currentYear);
    else setYear(years[years.length - 1]);
  }, [years, currentYear]);
  // chart data moved to BloodPressureChart (systolic/diastolic monthly sums)
  const selectedMonthlyData = useMemo<MonthlyData[]>(() => {
    const y = (structured.yearly_data || []).find((x) => x.year === year);
    return (y?.monthly_data || []) as MonthlyData[];
  }, [structured, year]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Patient Medical History</h2>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>
      
      <section className="w-full">
        {/* Section 1 */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 w-full">
          <Card className="w-full lg:max-w-1/2 xl:max-w-1/1">
            <CardHeader>
              <CardTitle>Vitals Trend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm">Filter Year</span>
                  <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select Year" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2" />
              </div>
              <BloodPressureChart selectedDatas={selectedMonthlyData} />
            </CardContent>
          </Card>
           
          <div className="w-full lg:min-w-[20rem] lg:max-w-[25rem] lg:h-[31.2rem] rounded-lg overflow-hidden">
            <Tabs defaultValue="report" className="w-full h-full flex flex-col">

              {/* Tabs Header */}
              <TabsList className="grid grid-cols-2 w-full bg-gray-100 rounded-t-none rounded-b-lg pt-1 pb-2">
            
                <TabsTrigger
                  value="report"
                  className="rounded-t-none rounded-b-lg text-sm font-medium transition-all
                  data-[state=active]:bg-white
                  data-[state=active]:text-[#00b2cb]
                  data-[state=active]:shadow-sm"
                >
                  Give Report
                </TabsTrigger>

                <TabsTrigger
                  value="details"
                  className="rounded-t-none rounded-b-lg text-sm font-medium transition-all
                  data-[state=active]:bg-white
                  data-[state=active]:text-[#ff5d00]
                  data-[state=active]:shadow-sm"
                >
                  Patient Details
                </TabsTrigger>

              </TabsList>

              {/* Tab Content */}
              <TabsContent value="report" className="flex-1 overflow-auto">
                <DoctorReport patientId={String(patientId)} />
              </TabsContent>

              <TabsContent value="details" className="flex-1 overflow-auto">
                <PatientProfileDetails patientBasic={patientBasic} />
              </TabsContent>

            </Tabs>
          </div>
          
        </div>
        

        {/* Section 2 ( Patient Details)*/}
        <RecentVitalSign />
      </section>
      
      <Card>
        <CardHeader>
          <CardTitle>Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-[8px] overflow-hidden">
              <thead className="bg-[#56bbe3] text-white">
                <tr>
                  <th className="px-4 py-2 text-left whitespace-nowrap">Date</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">Temperature (°C)</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">Pulse (bpm)</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">Respiration (rpm)</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">BP</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">SpO₂ (%)</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">FBS/RBS</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">Height (cm)</th>
                  <th className="px-4 py-2 text-left whitespace-nowrap">Weight (kg)</th>
                </tr>
              </thead>
              <tbody>
                {vitals.map((v: any) => (
                  <tr key={`${v.patientId}-${v.recordedAt}`} className="even:bg-[#f9f9f9] border-b border-gray-200">
                    <td className="px-4 py-2 whitespace-nowrap">{`${v.day}/${v.month}/${v.year}`}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{v.temperature ?? "-"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{v.pulse ?? "-"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{v.respirationRate ?? "-"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{v.bp ?? "-"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{v.spo2 ?? "-"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{v.fbsRbs ?? "-"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{v.height ?? "-"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{v.weight ?? "-"}</td>
                  </tr>
                ))}
                {vitals.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-4">No vitals recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
