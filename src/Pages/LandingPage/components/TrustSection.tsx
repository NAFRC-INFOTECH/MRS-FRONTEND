import { CheckCircle2, LockKeyhole, Radar, ScrollText } from "lucide-react";

const trustPoints = [
  {
    icon: LockKeyhole,
    title: "Role-based permissions",
    description: "Access is separated by admins and users responsibilities.",
  },
  {
    icon: ScrollText,
    title: "Audit-friendly operations",
    description: "Transferred patients, duties, reports, and lab statuses are easier to trace and review over time.",
  },
  {
    icon: Radar,
    title: "Real-time coordination",
    description: "The app already supports global sync and operational visibility where handoffs cannot afford delay.",
  },
  {
    icon: CheckCircle2,
    title: "Hospital-first UX",
    description: "Focused on fast actions, clean tables, queue movement, and low-friction departmental handoffs.",
  },
];

export default function TrustSection() {
  return (
    <section id="security" className="bg-slate-950 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Trust and control</div>
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-4xl">
              Secure, accountable, and ready for high-pressure operational environments.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              This is not just a marketing shell. It reflects the workflows already built into your system:
              permissions, duties, patient visibility, doctor reporting, transfers, and department-specific execution.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {trustPoints.map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
