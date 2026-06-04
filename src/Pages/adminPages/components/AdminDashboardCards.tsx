import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/Pages/adminPages/createPriceListsPage/components/priceListTypes";
import { BedDouble, Building2, ReceiptText, Stethoscope, Users } from "lucide-react";


export type AdminDashboardKpis = {
  periodLabel: string;
  departmentsTotal: number;
  doctorsTotal: number;
  staffTotal: number;
  patientsTotal: number;
  newPatients: number;
  wardAdmissions: number;
  paypointRevenue: number;
  nhiaClaimValue: number;
};

const CardColors = [
  { bg: "from-blue-50 to-blue-100", border: "border-blue-200", icon: "text-blue-600" },
  { bg: "from-green-50 to-green-100", border: "border-green-200", icon: "text-green-600" },
  { bg: "from-purple-50 to-purple-100", border: "border-purple-200", icon: "text-purple-600" },
  { bg: "from-orange-50 to-orange-100", border: "border-orange-200", icon: "text-orange-600" },
  { bg: "from-cyan-50 to-cyan-100", border: "border-cyan-200", icon: "text-cyan-600" },
  { bg: "from-pink-50 to-pink-100", border: "border-pink-200", icon: "text-pink-600" },
  { bg: "from-indigo-50 to-indigo-100", border: "border-indigo-200", icon: "text-indigo-600" },
  { bg: "from-teal-50 to-teal-100", border: "border-teal-200", icon: "text-teal-600" },
];

export default function AdminDashboardCards({
  kpis,
}: {
  kpis: AdminDashboardKpis;
}) {
  const cardData = [
    {
      title: "Patients",
      description: "All-time total",
      value: kpis.patientsTotal,
      icon: Users,
      color: CardColors[0],
    },
    {
      title: "New Patients",
      description: "In selected period",
      value: kpis.newPatients,
      icon: Users,
      color: CardColors[1],
    },
    {
      title: "Ward Admissions",
      description: "In selected period",
      value: kpis.wardAdmissions,
      icon: BedDouble,
      color: CardColors[2],
    },
    {
      title: "Paypoint Revenue",
      description: "Paid invoices (period)",
      value: formatCurrency(kpis.paypointRevenue),
      icon: ReceiptText,
      color: CardColors[3],
    },
    {
      title: "NHIA Claims",
      description: "Stamped invoices (period)",
      value: formatCurrency(kpis.nhiaClaimValue),
      icon: ReceiptText,
      color: CardColors[4],
    },
    {
      title: "Departments",
      description: "All-time total",
      value: kpis.departmentsTotal,
      icon: Building2,
      color: CardColors[5],
    },
    {
      title: "Doctors",
      description: "All-time total",
      value: kpis.doctorsTotal,
      icon: Stethoscope,
      color: CardColors[6],
    },
    {
      title: "Staff",
      description: "All-time total",
      value: kpis.staffTotal,
      icon: Users,
      color: CardColors[7],
    },
  ];

  return (
    <div className="space-y-6">
          

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cardData.map((card, idx) => (
          <Card
            key={idx}
            className={`overflow-hidden rounded-sm shadow-none border ${card.color.border} bg-gradient-to-br ${card.color.bg}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-[1.1rem] font-semibold">{card.title}</CardTitle>
                <CardDescription className="text-sm opacity-80">{card.description}</CardDescription>
              </div>
              <card.icon className={`h-6 w-6 ${card.color.icon}`} />
            </CardHeader>
            <CardContent>
              <div className="text-[1.5rem] font-bold text-gray-900 dark:text-white">
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

