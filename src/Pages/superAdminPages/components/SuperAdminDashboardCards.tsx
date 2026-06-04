import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  ReceiptText, 
  Building2, 
  Stethoscope, 
  UserCheck,
  Activity,
  TestTube,
  X,
  CalendarCheck,
  ClipboardList
} from 'lucide-react';

export interface SuperAdminDashboardKpis {
  periodLabel: string;
  totalUsers: number;
  totalPatients: number;
  newPatients: number;
  totalDoctors: number;
  totalNurses: number;
  totalDepartments: number;
  totalInvoices: number;
  totalRevenue: number;
  totalVitals: number;
  totalClinicalDayLists: number;
  totalLabReferrals: number;
  totalXrayReferrals: number;
  totalWardAdmissions: number;
}

const CardColors = [
  { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', icon: 'text-blue-600' },
  { bg: 'from-green-50 to-green-100', border: 'border-green-200', icon: 'text-green-600' },
  { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', icon: 'text-purple-600' },
  { bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', icon: 'text-orange-600' },
  { bg: 'from-cyan-50 to-cyan-100', border: 'border-cyan-200', icon: 'text-cyan-600' },
  { bg: 'from-pink-50 to-pink-100', border: 'border-pink-200', icon: 'text-pink-600' },
  { bg: 'from-indigo-50 to-indigo-100', border: 'border-indigo-200', icon: 'text-indigo-600' },
  { bg: 'from-teal-50 to-teal-100', border: 'border-teal-200', icon: 'text-teal-600' },
  { bg: 'from-emerald-50 to-emerald-100', border: 'border-emerald-200', icon: 'text-emerald-600' },
  { bg: 'from-rose-50 to-rose-100', border: 'border-rose-200', icon: 'text-rose-600' },
  { bg: 'from-amber-50 to-amber-100', border: 'border-amber-200', icon: 'text-amber-600' },
  { bg: 'from-violet-50 to-violet-100', border: 'border-violet-200', icon: 'text-violet-600' },
];

export default function SuperAdminDashboardCards({ kpis }: { kpis: SuperAdminDashboardKpis }) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const cardData = [
    {
      title: 'Total Users',
      description: 'All system users',
      value: kpis.totalUsers,
      icon: Users,
      color: CardColors[0],
    },
    {
      title: 'Total Patients',
      description: 'All registered patients',
      value: kpis.totalPatients,
      icon: Users,
      color: CardColors[1],
    },
    {
      title: 'New Patients',
      description: 'In selected period',
      value: kpis.newPatients,
      icon: UserPlus,
      color: CardColors[2],
    },
    {
      title: 'Total Doctors',
      description: 'All registered doctors',
      value: kpis.totalDoctors,
      icon: Stethoscope,
      color: CardColors[3],
    },
    {
      title: 'Total Nurses',
      description: 'All registered nurses',
      value: kpis.totalNurses,
      icon: UserCheck,
      color: CardColors[4],
    },
    {
      title: 'Total Departments',
      description: 'All departments',
      value: kpis.totalDepartments,
      icon: Building2,
      color: CardColors[5],
    },
    {
      title: 'Total Invoices',
      description: 'All generated invoices',
      value: kpis.totalInvoices,
      icon: ReceiptText,
      color: CardColors[6],
    },
    {
      title: 'Total Revenue',
      description: 'Total generated revenue',
      value: formatCurrency(kpis.totalRevenue),
      icon: DollarSign,
      color: CardColors[7],
    },
    {
      title: 'Vitals Records',
      description: 'Vitals taken in period',
      value: kpis.totalVitals,
      icon: Activity,
      color: CardColors[8],
    },
    {
      title: 'Clinical Day Lists',
      description: 'Day lists created',
      value: kpis.totalClinicalDayLists,
      icon: ClipboardList,
      color: CardColors[9],
    },
    {
      title: 'Lab Referrals',
      description: 'Lab referrals sent',
      value: kpis.totalLabReferrals,
      icon: TestTube,
      color: CardColors[10],
    },
    {
      title: 'X-Ray Referrals',
      description: 'X-Ray referrals sent',
      value: kpis.totalXrayReferrals,
      icon: X,
      color: CardColors[11],
    },
    {
      title: 'Ward Admissions',
      description: 'Admissions in period',
      value: kpis.totalWardAdmissions,
      icon: CalendarCheck,
      color: CardColors[0],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cardData.map((card, idx) => (
          <Card
            key={idx}
            className={`overflow-hidden rounded-md border ${card.color.border} bg-gradient-to-br ${card.color.bg}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-[1rem] font-semibold">{card.title}</CardTitle>
                <p className="text-sm opacity-80">{card.description}</p>
              </div>
              <card.icon className={`h-7 w-7 ${card.color.icon}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
