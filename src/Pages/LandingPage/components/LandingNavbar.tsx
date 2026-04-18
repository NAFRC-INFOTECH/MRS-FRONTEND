import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Platform", href: "#platform" },
  { label: "Departments", href: "#departments" },
  { label: "Operations", href: "#operations" },
  { label: "Security", href: "#security" },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#platform");

  // scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
      fixed top-0 z-50
      transition-all duration-300 ease-in-out
      w-full
      ${open ? "bg-slate-950 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/10" : ""}
      
      ${
        scrolled
          ? "bg-slate-950 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/10"
          : "bg-slate-950 backdrop-blur-xl lg:backdrop-blur-none shadow-lg lg:shadow-none shadow-black/20 lg:bg-transparent border-b border-transparent "
      }
    `}
    >
      <div
        className={`
        mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8
        transition-all duration-300
        ${scrolled ? "py-3" : "py-3"}
      `}
      >
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <div
            className={`
            flex items-center justify-center rounded-xl
            bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/20
            transition-all duration-300
            ${scrolled ? "h-10 w-10" : "h-11 w-11"}
          `}
          >
            <Stethoscope className="h-5 w-5" />
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-300/80">
              NAFRC-MRS
            </div>
            <div className="text-sm font-semibold text-gray-400 lg:text-gray-300 sm:text-base">
              Medical Records Suite
            </div>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setActive(item.href)}
              className="group relative text-sm text-slate-300 transition hover:text-white"
            >
              {item.label}

              {/* underline indicator */}
              <span
                className={`
                  absolute left-0 -bottom-1 h-[2px] w-full
                  origin-left transition-transform duration-300 ease-out
                  ${active === item.href ? "scale-x-100 bg-gradient-to-r from-cyan-400 to-blue-500" : "scale-x-0 bg-gradient-to-r from-gray-400 to-gray-700 group-hover:scale-x-100"}
                `}
              />
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button
            asChild
            className="
            bg-cyan-500 text-slate-950 hover:bg-cyan-400
            px-8 py-2 rounded-xs
            shadow-md shadow-cyan-500/10
            transition-all duration-300
            hover:shadow-cyan-400/30
          "
          >
            <Link to="/login">Login</Link>
          </Button>
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-slate-100 lg:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`
        hidden md:block  lg:hidden overflow-hidden transition-all duration-300
        ${open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}
      `}
      >
        <div className="border-t border-white/10 bg-slate-950/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => {
                  setActive(item.href);
                  setOpen(false);
                }}
                className="rounded-xs px-3 py-3 text-sm text-slate-200 transition hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}

            <Button
              asChild
              className="mt-2 w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-xs"
            >
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-[100vh] w-[75%] max-w-xs
          bg-slate-950/95 backdrop-blur-xl border-r border-white/10
          transform transition-transform duration-300 ease-in-out
          md:hidden
          mt-17
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col justify-between gap-2 px-4 py-6 sm:px-6 h-full pb-25 bg-slate-950/95 backdrop-blur-xl border-r border-white/10">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => {
                  setActive(item.href);
                  setOpen(false);
                }}
                className="rounded-xs px-3 py-3 text-sm text-slate-200 transition hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
          </div>

          <Button
            asChild
            className="mt-2 w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-xs"
          >
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}