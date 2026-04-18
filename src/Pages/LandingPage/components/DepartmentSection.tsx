import { FlaskConical, HeartPulse, ShieldPlus, UserCog, Users } from "lucide-react";

const departments = [
  {
    icon: Users,
    title: "Recording Department",
    description: "Manage patient registration, staff duty schedules, and the record pipeline with high accountability.",
  },
  {
    icon: HeartPulse,
    title: "Doctors and GOPD",
    description: "Track today’s patients, histories, reports, queue movement, referrals, and daily transfer activity.",
  },
  {
    icon: FlaskConical,
    title: "Lab Operations",
    description: "Receive referrals with patient context attached, process them, and update statuses from pending to completed.",
  },
  {
    icon: ShieldPlus,
    title: "Nursing Teams",
    description: "Support triage, vitals, department-specific work, and shift-based continuity across care points.",
  },
  {
    icon: UserCog,
    title: "Leadership and Control",
    description: "Give super admins and admins oversight into departments, staff, duties, service users, and platform activity.",
  },
];

export default function DepartmentSection() {
  return (
    <section id="departments" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex max-w-3xl flex-col gap-5">
        <div className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-600">Departments</div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Built to serve the teams already inside this hospital ecosystem.
        </h2>
        <p className="text-lg leading-8 text-slate-600">
          Every major operational role in the application has a place here, from recording and nursing to doctors,
          lab teams, admins, and super admins.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm"
          >
            <div className="flex flex-col items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-base leading-7 text-slate-600">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
