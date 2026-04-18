import { Activity, BellRing, ClipboardList, Shield, Stethoscope, Syringe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const capabilities = [
  {
    icon: ClipboardList,
    title: "Patient operations",
    description: "Move from registration to queueing, triage, review, referral, and completion without fragmented records.",
  },
  {
    icon: Stethoscope,
    title: "Doctor workflow",
    description: "See today’s patients, review history, create reports, and transfer patients to departments with context attached.",
  },
  {
    icon: Syringe,
    title: "Nursing workflow",
    description: "Handle duties, vitals, patient routing, and department-based access across GOPD, general permit, and lab.",
  },
  {
    icon: Activity,
    title: "Clinical continuity",
    description: "Keep reports, vitals, referrals, and departmental actions connected around the patient journey.",
  },
  {
    icon: BellRing,
    title: "Operational visibility",
    description: "Track transferred patients, lab referral statuses, daily duties, and handoff activity in one view.",
  },
  {
    icon: Shield,
    title: "Role-based security",
    description: "Control visibility and actions for super admins, admins, recording teams, doctors, and nurses.",
  },
];

export default function CapabilityGrid() {
  return (
    <section id="platform" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <div className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-600">Platform</div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Everything your care teams need to coordinate, document, and act with speed.
        </h2>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          This platform is already shaped around the realities of your environment: recording, doctors,
          nurses, patient queues, referrals, and duty scheduling all living inside one operational system.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((item) => (
          <Card key={item.title} className="border-slate-200/80 bg-white shadow-lg shadow-slate-200/40">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700">
                <item.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl text-slate-950">{item.title}</CardTitle>
              <CardDescription className="text-base leading-7 text-slate-600">
                {item.description}
              </CardDescription>
            </CardHeader>
            {/* <CardContent className="pt-0 text-sm text-slate-500">
              Built for speed, clarity, and handoff confidence across departments.
            </CardContent> */}
          </Card>
        ))}
      </div>
    </section>
  );
}
