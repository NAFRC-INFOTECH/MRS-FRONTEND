import LandingNavbar from "./components/LandingNavbar";
import HeroSection from "./components/HeroSection";
import CapabilityGrid from "./components/CapabilityGrid";
import WorkflowSection from "./components/WorkflowSection";
import DepartmentSection from "./components/DepartmentSection";
import TrustSection from "./components/TrustSection";
import CallToAction from "./components/CallToAction";
import LandingFooter from "./components/LandingFooter";

export default function LandingPage() {
  return (
    <div className="relative bg-white text-slate-950">
      <div className="absolute w-full">
        <LandingNavbar />
      </div>
      <main className="">
        <HeroSection />
        <CapabilityGrid />
        <WorkflowSection />
        <DepartmentSection />
        <TrustSection />
        <CallToAction />
      </main>
      <LandingFooter />
    </div>
  );
}
