import {
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const metrics = [
  { label: "Unified care flow", value: "One Platform" },
  { label: "Role aware access", value: "Admin to Labs" },
  { label: "Hospital uptime", value: "24/7 Ready" },
];


export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center overflow-hidden bg-slate-950 w-full">

      {/* 🎥 Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-30 lg:opacity-20"
      >
        <source src="/videos/hospital-video.mp4" type="video/mp4" />
      </video>

      {/* background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.15),transparent_15%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.15),transparent_95%)]" />
      {/* grid overlay */}
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:60px_60px]" />

      <div className="gap-16 z-20 py-15 md:py-24 md:px-10 flex flex-col items-center justify-center">
        {/* LEFT CONTENT */}
        <div className="w-full flex flex-col items-center mt-16">
          <Badge
            className="mx-auto hidden sm:inline-flex  mb-6 items-center justify-center max-w-[90%] sm:max-w-xl rounded-full bg-cyan-500/15
            px-5 sm:px-7
            py-2
            text-center text-sm sm:text-base
            text-cyan-200
            ring-1 ring-cyan-400/25
            backdrop-blur-md
           
          "
          >
            Hospital workflow, patient records and coordination in one system
          </Badge>

          <h1 className="w-full md:max-w-4xl text-center text-3xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            The digital backbone for{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              fast and coordinated
            </span>{" "}
            hospital care.
          </h1>

          <p className="mt-6 max-w-3xl text-slate-300 text-md sm:text-lg leading-relaxed text-center">
            DHML-MRS connects patient registration, consultations, referrals,
            lab processes and reporting into a single intelligent workflow so
            medical teams spend less time managing systems and more time caring
            for patients.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row w-full md:max-w-[15rem] px-4">
            <Button
              size="lg"
              asChild
              className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-xs shadow-md shadow-cyan-500/20"
            >
              <a href="#platform" className="w-full flex items-center justify-center">
                Explore Platform
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <Button
              size="lg"
              asChild
              className="w-full border-white/20 text-white bg-white text-black rounded-xs py-2 hover:bg-white/80"
            >
              <a href="#security" className="w-full flex items-center justify-center">View Security Model</a>
            </Button>
          </div>

          {/* METRICS */}
          <div className="mt-12">
            <div className="flex flex-wrap justify-center gap-4">

              {metrics.map((item) => (
                <div
                  key={item.label}
                  className="
                  w-[160px] sm:w-[200px]
                  rounded-md
                  border border-white/10
                  bg-gradient-to-b from-white/10 to-white/5
                  p-5
                  text-center
                  backdrop-blur-md
                  transition
                  hover:bg-white/10
                  hover:shadow-lg hover:shadow-cyan-500/10
                  "
                >
                  <div className="text-lg sm:text-2xl font-semibold text-white">
                    {item.value}
                  </div>

                  <div className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {item.label}
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
      </div>
    </section>
  );
}