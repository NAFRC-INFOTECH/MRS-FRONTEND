import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CallToAction() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-xl border border-cyan-200/40 bg-[linear-gradient(135deg,_rgba(34,211,238,0.14),_rgba(15,23,42,0.05)_40%,_rgba(59,130,246,0.12))] p-8 sm:p-10 lg:p-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">Get started</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Launch a cleaner, faster, and more connected care operation.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              Whether you are improving patient intake, doctor handoffs, department operations, or staffing visibility,
              this platform gives your hospital one operational source of truth.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-slate-950 text-white hover:bg-slate-800 min-w-[150px]">
              <Link to="/login">
                Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
