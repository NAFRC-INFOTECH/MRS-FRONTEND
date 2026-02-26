import { useEffect } from "react";
import { toast } from "sonner";

export default function GlobalClientLogging() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      const msg = e?.message || "Runtime error";
      toast.error(msg);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r: unknown = (e as unknown as { reason?: unknown })?.reason;
      const msg = r instanceof Error ? r.message : String(r ?? "");
      toast.error(msg || "Unhandled rejection");
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    const originalError: typeof console.error = console.error;
    const originalWarn: typeof console.warn = console.warn;
    console.error = (...args: unknown[]) => {
      const msg = args?.map((a) => (typeof a === "string" ? a : "")).join(" ").trim();
      if (msg) toast.error(msg);
      originalError(...args);
    };
    console.warn = (...args: unknown[]) => {
      const msg = args?.map((a) => (typeof a === "string" ? a : "")).join(" ").trim();
      if (msg) toast.warning ? toast.warning(msg) : toast.info(msg);
      originalWarn(...args);
    };
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);
  return null;
}
