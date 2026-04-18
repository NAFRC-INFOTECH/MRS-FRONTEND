import { Link } from "react-router-dom";

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-slate-500 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
        <div className="w-full md:max-w-[45vw] lg:min-w-[50vw]">
          <div className="font-semibold text-slate-900">DHML-MRS</div>
          <div className="mt-1">Hospital operations, records, referrals, and staffing in one connected platform.</div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center gap-5">
          <a href="#platform" className="transition hover:text-slate-900">Platform</a>
          <a href="#departments" className="transition hover:text-slate-900">Departments</a>
          <a href="#security" className="transition hover:text-slate-900">Security</a>
          <Link to="/login" className="transition hover:text-slate-900">Login</Link>
        </div>
      </div>
    </footer>
  );
}
