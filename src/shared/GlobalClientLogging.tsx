import { useEffect } from "react";
import { toast } from "sonner";

export default function GlobalClientLogging() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      const msg = e?.message || "Runtime error";
      toast.error(msg);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const anyReason: any = (e as any)?.reason;
      const reason = anyReason?.message || String(anyReason || "");
      toast.error(reason || "Unhandled rejection");
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    const originalError = console.error;
    const originalWarn = console.warn;
    console.error = (...args: any[]) => {
      const msg = args?.map((a) => (typeof a === "string" ? a : "")).join(" ").trim();
      if (msg) toast.error(msg);
      originalError(...args);
    };
    console.warn = (...args: any[]) => {
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
