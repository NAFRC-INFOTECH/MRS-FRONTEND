import { Activity, HeartPulse, Microscope, ShieldCheck, UsersRound } from 'lucide-react'

export default function RightHero() {
const quickSignals = [
  { icon: UsersRound, text: "Patient registry and real time queue management" },
  { icon: HeartPulse, text: "Vitals capture, doctor consultation and treatment flow" },
  { icon: Microscope, text: "Lab referrals with transparent status tracking" },
  { icon: ShieldCheck, text: "Secure role access for admin, doctors and nurses" },
];
  return (
    <div className="relative">

          {/* glow effects */}
          <div className="absolute -left-10 top-10 h-32 w-32 bg-cyan-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 right-0 h-32 w-32 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">

            <div className="rounded-[28px] border border-white/10 bg-slate-900/90 p-6">

              {/* header */}
              <div className="flex items-center justify-between mb-6">

                <div>
                  <div className="text-sm text-slate-400">
                    Hospital activity monitor
                  </div>
                  <div className="text-xl font-semibold text-white">
                    Live workflow
                  </div>
                </div>

                <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium bg-emerald-500/15 px-3 py-1 rounded-full">
                  <Activity className="h-3 w-3" />
                  Real time
                </div>

              </div>

              {/* signals */}
              <div className="space-y-3">

                {quickSignals.map((item) => (
                  <div
                    key={item.text}
                    className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                      <item.icon className="h-5 w-5" />
                    </div>

                    <p className="text-sm text-slate-200 leading-relaxed">
                      {item.text}
                    </p>

                  </div>
                ))}

              </div>

            </div>
          </div>
        </div>
  )
}
