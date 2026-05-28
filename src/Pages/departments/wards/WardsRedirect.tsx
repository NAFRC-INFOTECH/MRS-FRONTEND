import { Navigate } from "react-router-dom";
import { useUser } from "@/api-integration/redux/selectors";

export default function WardsRedirect() {
  const user = useUser();
  const dept = String((user as any)?.department || "").toLowerCase();
  if (dept.includes("children")) return <Navigate to="/wards/children" replace />;
  if (dept.includes("femalevip") || dept.includes("female vip")) return <Navigate to="/wards/female-vip" replace />;
  if (dept.includes("malevip") || dept.includes("male vip")) return <Navigate to="/wards/male-vip" replace />;
  if (dept.includes("female")) return <Navigate to="/wards/female" replace />;
  if (dept.includes("male")) return <Navigate to="/wards/male" replace />;
  return <Navigate to="/" replace />;
}

