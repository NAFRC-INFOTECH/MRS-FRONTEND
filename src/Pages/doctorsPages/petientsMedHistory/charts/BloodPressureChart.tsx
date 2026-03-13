import { Area, AreaChart, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { MonthlyData } from "../../types/patientstypes";

const BloodPressureChart = ({ selectedDatas }: { selectedDatas: MonthlyData[] }) => {
  const processedData = selectedDatas.map((monthData) => {
    const totalSystolic = monthData.vital_signs.reduce(
      (sum: number, entry: { systolic_blood_pressure?: number }) =>
        sum + (entry.systolic_blood_pressure || 0),
      0
    );

    const totalDiastolic = monthData.vital_signs.reduce(
      (sum: number, entry: { diastolic_blood_pressure?: number }) =>
        sum + (entry.diastolic_blood_pressure || 0),
      0
    );

    return {
      month: monthData.month,
      systolic: totalSystolic,
      diastolic: totalDiastolic,
    };
  });

  return (
    <div className="bg-white dark:bg-darkComponentsBg rounded-lg w-full">
      <ChartContainer
        config={{
          systolic: { label: "Systolic", color: "#00b2cb" },
          diastolic: { label: "Diastolic", color: "#ea996c" },
        }}
        className="w-full h-[250px] sm:h-[300px] md:h-[325px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 8, right: 8, left: -30, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} interval="preserveStartEnd" minTickGap={16} tickMargin={8} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<ChartTooltipContent />} />

            <Area
              type="monotone"
              dataKey="systolic"
              stroke="#00b2cb"
              strokeWidth={1}
              fill="#00b2cb"
              fillOpacity={0.4}
            />

            <Area
              type="monotone"
              dataKey="diastolic"
              stroke="#ff5d00"
              strokeWidth={1}
              fill="#ff5d00"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default BloodPressureChart;
