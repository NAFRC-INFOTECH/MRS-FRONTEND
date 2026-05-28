import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "@/api-integration/types/types";
import { useIsAuthenticated, useUser } from "@/api-integration/redux/selectors";

interface RequireAuthProps {
  roles?: Role[];
  departments?: string[];
}

export default function RequireAuth({ roles, departments }: RequireAuthProps) {
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const normalize = (value: string) => String(value || "").toLowerCase().replace(/[^a-z]/g, "");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user) {
    return null;
  }

  if (roles?.length) {
    const hasRole = user?.roles?.some((r: Role) => roles.includes(r));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  if (
    departments?.length &&
    (user.roles?.includes("staff" as Role) || user.roles?.includes("clinical" as Role) || (user.roles as any)?.includes?.("nurse"))
  ) {
    const userDept = normalize(user?.department || "");
    const deptList = departments.map((d) => normalize(d));
    const okDept = !!userDept && (deptList.includes(userDept) || userDept === "general");
    if (!okDept) return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
