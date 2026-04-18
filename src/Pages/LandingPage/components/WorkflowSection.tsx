const workflowSteps = [
  {
    step: "01",
    title: "Register and route patients",
    description: "Recording teams create and update patient records, maintain registry accuracy, and move patients into the right workflow quickly.",
  },
  {
    step: "02",
    title: "Assess and consult",
    description: "Nurses capture vitals and queue data while doctors access history, write reports, and make department transfer decisions.",
  },
  {
    step: "03",
    title: "Coordinate departments",
    description: "Lab and related units receive structured referrals, update statuses, and keep the care chain visible across departments.",
  },
  {
    step: "04",
    title: "Manage staffing and continuity",
    description: "Daily duties, emergency reassignment, and department permissions help keep the facility running around the clock.",
  },
];

export default function WorkflowSection() {
  return (
    <section id="operations" className="bg-slate-950 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Operations</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              Designed around the real workflow of a hospital, not a generic admin panel.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              From a patient entering the system to clinical action, departmental processing, and staff duty coordination,
              the platform keeps people, records, and next steps connected.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {workflowSteps.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="flex flex-col gap-4 items-start">
                  <div className="text-sm font-semibold text-cyan-300 bg-gray-800 h-8 w-8 rounded-full flex items-center justify-center">{item.step}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-base leading-7 text-slate-300">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
