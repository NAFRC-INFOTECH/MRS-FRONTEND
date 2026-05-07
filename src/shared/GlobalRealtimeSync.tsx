import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

export default function GlobalRealtimeSync() {
  const qc = useQueryClient();
  useEffect(() => {
    const url = `${location.protocol}//${location.hostname}:8000/ws`;
    const socket = io(url, {
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1500,
      reconnectionAttempts: Infinity,
    });
    
    const onConnectError = (err: Error) => {
      console.error("Socket.io connect error:", err.message);
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
      qc.invalidateQueries({ queryKey: ["patient"] });
      qc.invalidateQueries({ queryKey: ["gopd-queue"] });
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
    socket.on("user.updated", onUserUpdated);
    socket.on("user.deleted", onUserDeleted);
    socket.on("profile.updated", onProfileUpdated);
    socket.on("profile.deleted", onProfileDeleted);
    socket.on("patient.created", onPatientChanged);
    socket.on("patient.updated", onPatientChanged);
    socket.on("patient.deleted", onPatientChanged);
    socket.on("connect_error", onConnectError);
    return () => {
      socket.off("patient.created", onPatientChanged);
      socket.off("patient.updated", onPatientChanged);
      socket.off("patient.deleted", onPatientChanged);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [qc]);
  return null;
}
