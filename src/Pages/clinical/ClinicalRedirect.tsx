import { Navigate } from "react-router-dom";
import { useUser } from "@/api-integration/redux/selectors";

export default function ClinicalRedirect() {
  const user = useUser();
  const dept = String((user as any)?.department || "").toLowerCase();
  if (dept.includes("ear")) return <Navigate to="/clinical/ear" replace />;
  if (dept.includes("eye")) return <Navigate to="/clinical/eye" replace />;
  return <Navigate to="/" replace />;
}

