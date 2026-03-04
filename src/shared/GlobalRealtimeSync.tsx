import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

export default function GlobalRealtimeSync() {
  const qc = useQueryClient();
  useEffect(() => {
    const url = `${location.protocol}//${location.hostname}:8000/ws`;
    const socket = io(url, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1500,
      reconnectionAttempts: Infinity,
    });
    const onConnectError = () => {
      try {
        socket.io.opts.transports = ["polling", "websocket"];
        socket.connect();
      } catch {}
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
    socket.on("user.updated", onUserUpdated);
    socket.on("user.deleted", onUserDeleted);
    socket.on("profile.updated", onProfileUpdated);
    socket.on("profile.deleted", onProfileDeleted);
    socket.on("connect_error", onConnectError);
    return () => {
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [qc]);
  return null;
}
