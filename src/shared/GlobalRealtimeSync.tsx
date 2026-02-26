import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

export default function GlobalRealtimeSync() {
  const qc = useQueryClient();
  useEffect(() => {
    const socket = io(`${location.protocol}//${location.hostname}:8000/ws`, {
      withCredentials: true,
    });
    const invalidateUsers = () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      qc.invalidateQueries({ queryKey: ["users", "all"] });
      qc.invalidateQueries({ queryKey: ["users", "nurses"] });
    };
    const invalidateProfiles = () => {
      qc.invalidateQueries({ queryKey: ["doctor-profiles"] });
      qc.invalidateQueries({ queryKey: ["doctor-profile", "me"] });
      qc.invalidateQueries({ queryKey: ["profile", "me"] });
    };
    const onUserUpdated = () => invalidateUsers();
    const onUserDeleted = () => invalidateUsers();
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
    return () => {
      socket.disconnect();
    };
  }, [qc]);
  return null;
}
