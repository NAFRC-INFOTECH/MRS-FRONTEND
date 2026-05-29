import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/api-integration/api/config";

export default function GlobalRealtimeSync() {
  const qc = useQueryClient();
  useEffect(() => {
    if ((import.meta as any).env?.VITE_DISABLE_REALTIME === "true") return;

    const envWsUrl = ((import.meta as any).env?.VITE_WS_URL as string | undefined) || "";
    const url = (() => {
      if (envWsUrl) return envWsUrl;
      try {
        return `${new URL(API_BASE_URL).origin}/ws`;
      } catch {
        return `${location.origin}/ws`;
      }
    })();
    const socket = io(url, {
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1500,
      reconnectionAttempts: Infinity,
      timeout: 5000,
    });
    
    const onConnectError = (err: Error) => {
      if ((import.meta as any).env?.DEV) console.warn("Socket.io connect error:", err.message);
    };
    const invalidateUsers = () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["users", "all"] });
      qc.invalidateQueries({ queryKey: ["users", "nurses"] });
    };
    const invalidateProfiles = () => {
      qc.invalidateQueries({ queryKey: ["users", "doctors"] });
      qc.invalidateQueries({ queryKey: ["doctor-profile"] });
      qc.invalidateQueries({ queryKey: ["doctor-profile", "me"] });
      qc.invalidateQueries({ queryKey: ["profile", "me"] });
    };
    const invalidatePatients = () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      qc.invalidateQueries({ queryKey: ["patients", "paypoint"] });
      qc.invalidateQueries({ queryKey: ["patients", "nhia"] });
      qc.invalidateQueries({ queryKey: ["patients", "nhia", "stats"] });
      qc.invalidateQueries({ queryKey: ["patients", "pharmacy"] });
      qc.invalidateQueries({ queryKey: ["patient"] });
      qc.invalidateQueries({ queryKey: ["gopd-queue"] });
    };
    const invalidateInvoices = () => {
      qc.invalidateQueries({ queryKey: ["invoices", "all"] });
      qc.invalidateQueries({ queryKey: ["invoices", "patient"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    };
    const invalidateWards = () => {
      qc.invalidateQueries({ queryKey: ["wards", "admissions"] });
    };
    const onUserUpdated = () => {
      invalidateUsers();
      invalidateProfiles();
    };
    const onUserDeleted = () => {
      invalidateUsers();
      invalidateProfiles();
    };
    const onProfileUpdated = () => {
      invalidateProfiles();
      invalidateUsers();
    };
    const onProfileDeleted = () => {
      invalidateProfiles();
      invalidateUsers();
    };
    const onPatientChanged = () => {
      invalidatePatients();
    };
    const onInvoiceChanged = () => {
      invalidateInvoices();
    };
    socket.on("user.updated", onUserUpdated);
    socket.on("user.deleted", onUserDeleted);
    socket.on("profile.updated", onProfileUpdated);
    socket.on("profile.deleted", onProfileDeleted);
    socket.on("patient.created", onPatientChanged);
    socket.on("patient.updated", onPatientChanged);
    socket.on("patient.deleted", onPatientChanged);
    socket.on("invoice.created", onInvoiceChanged);
    socket.on("invoice.updated", onInvoiceChanged);
    socket.on("wardAdmission.created", invalidateWards);
    socket.on("wardAdmission.updated", invalidateWards);
    socket.on("connect_error", onConnectError);
    return () => {
      socket.off("patient.created", onPatientChanged);
      socket.off("patient.updated", onPatientChanged);
      socket.off("patient.deleted", onPatientChanged);
      socket.off("invoice.created", onInvoiceChanged);
      socket.off("invoice.updated", onInvoiceChanged);
      socket.off("wardAdmission.created", invalidateWards);
      socket.off("wardAdmission.updated", invalidateWards);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [qc]);
  return null;
}
