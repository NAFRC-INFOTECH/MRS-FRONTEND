import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#56bbe3', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

interface SuperAdminDashboardChartsProps {
  revenueSeries: Array<{ name: string; value: number }>;
  patientGrowthSeries: Array<{ name: string; value: number }>;
  wardAdmissionsByUnit: Array<{ wardUnit: string; admissions: number }>;
  referralsSplit: Array<{ name: string; value: number }>;
  userRolesSplit: Array<{ name: string; value: number }>;
}

export default function SuperAdminDashboardCharts({
  revenueSeries,
  patientGrowthSeries,
  wardAdmissionsByUnit,
  referralsSplit,
  userRolesSplit,
}: SuperAdminDashboardChartsProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const tooltipValue = (value: number) => {
    return [value.toLocaleString(), 'Count'];
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* Revenue Trend - Area Chart */}
      <Card className="xl:col-span-2 border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="border-b border-blue-100 pb-4">
          <CardTitle className="text-xl font-bold text-gray-800">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueSeries}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#56bbe3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#56bbe3" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#475569', fontSize: 12 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                labelFormatter={(label) => `Period: ${label}`}
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

      {/* User Roles - Donut Chart */}
      <Card className="border-0 bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="border-b border-purple-100 pb-4">
          <CardTitle className="text-xl font-bold text-gray-800">User Roles</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={userRolesSplit}
                dataKey="value"
                nameKey="name"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                animationDuration={1500}
              >
                {userRolesSplit.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
                formatter={tooltipValue}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '14px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Patient Growth - Area Chart */}
      <Card className="xl:col-span-2 border-0 bg-gradient-to-br from-white to-green-50">
        <CardHeader className="border-b border-green-100 pb-4">
          <CardTitle className="text-xl font-bold text-gray-800">Patient Growth</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={patientGrowthSeries}>
              <defs>
                <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#dcfce7" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#475569', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
                formatter={tooltipValue}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPatients)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Referrals Split - Donut Chart */}
      <Card className="border-0 bg-gradient-to-br from-white to-orange-50">
        <CardHeader className="border-b border-orange-100 pb-4">
          <CardTitle className="text-xl font-bold text-gray-800">Referrals</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={referralsSplit}
                dataKey="value"
                nameKey="name"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                animationDuration={1500}
              >
                {referralsSplit.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[(idx + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
                formatter={tooltipValue}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '14px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ward Admissions by Unit - Bar Chart */}
      {wardAdmissionsByUnit.length > 0 && (
        <Card className="xl:col-span-3 border-0 bg-gradient-to-br from-white to-indigo-50">
          <CardHeader className="border-b border-indigo-100 pb-4">
            <CardTitle className="text-xl font-bold text-gray-800">Ward Admissions by Unit</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardAdmissionsByUnit} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" vertical={false} />
                <XAxis
                  dataKey="wardUnit"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#475569', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#475569', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                  formatter={tooltipValue}
                />
                <Bar
                  dataKey="admissions"
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
