import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/Pages/adminPages/createPriceListsPage/components/priceListTypes";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#56bbe3", "#a855f7", "#f59e0b", "#22c55e", "#ef4444", "#64748b"];

export type RouteSplitDatum = { name: string; value: number };
export type SeriesDatum = { name: string; value: number };
export type WardUnitDatum = { wardUnit: string; admissions: number };
export type NHIAStatusDatum = { name: string; value: number };

const tooltipValue = (v: any) => (typeof v === "number" ? v.toLocaleString() : String(v ?? ""));

export default function AdminDashboardCharts({
  revenueSeries,
  routeSplit,
  wardByUnit,
  nhiaStatus,
}: {
  revenueSeries: SeriesDatum[];
  routeSplit: RouteSplitDatum[];
  wardByUnit: WardUnitDatum[];
  nhiaStatus: NHIAStatusDatum[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* Revenue Trend */}
      <Card className="xl:col-span-2 border-1 shadow-none">
        <CardHeader className="border-b border-blue-100 pb-2">
          <CardTitle className="text-xl font-bold text-gray-800">Paypoint Revenue Trend</CardTitle>
          <CardDescription className="text-gray-600">Paid invoices only (sum of total cost).</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueSeries} style={{ marginLeft: -40 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#56bbe3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#56bbe3" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#475569", fontSize: 12 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
                formatter={(value: any) => [formatCurrency(Number(value ?? 0) || 0), "Revenue"]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#56bbe3"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cleared Invoices Donut */}
      <Card className="border-1 shadow-none">
        <CardHeader className="border-b border-purple-100 pb-4">
          <CardTitle className="text-xl font-bold text-gray-800">Cleared Invoices</CardTitle>
          <CardDescription className="text-gray-600">Split by billing route.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={routeSplit}
                dataKey="value"
                nameKey="name"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                animationDuration={1500}
              >
                {routeSplit.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",

                }}
                formatter={tooltipValue}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "14px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ward Admissions Bar Chart */}
      <Card className="xl:col-span-2 border-1 shadow-none">
        <CardHeader className="border-b border-green-100 pb-4">
          <CardTitle className="text-xl font-bold text-gray-800">Ward Admissions by Unit</CardTitle>
          <CardDescription className="text-gray-600">Admissions count in selected period.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wardByUnit} margin={{ top: 10, right: 30, left: -40, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dcfce7" vertical={false} />
              <XAxis
                dataKey="wardUnit"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#475569", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#475569", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",

                }}
                formatter={tooltipValue}
              />
              <Bar
                dataKey="admissions"
                fill="#a855f7"
                radius={[8, 8, 0, 0]}
                animationDuration={1500}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* NHIA Status Pie Chart */}
      <Card className="border-1 shadow-none">
        <CardHeader className="border-b border-orange-100 pb-4">
          <CardTitle className="text-xl font-bold text-gray-800">NHIA Status</CardTitle>
          <CardDescription className="text-gray-600">Patients processed by NHIA in selected period.</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={nhiaStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                animationDuration={2500}
              >
                {nhiaStatus.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[(idx + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",

                }}
                formatter={tooltipValue}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "14px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

