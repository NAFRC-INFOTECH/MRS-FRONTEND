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

  if (departments?.length && user.roles?.includes("nurse" as Role)) {
    const userDept = (user?.department || "").toLowerCase();
    const deptList = departments.map((d) => d.toLowerCase());
    const okDept = !!userDept && (userDept === "general" || deptList.includes(userDept));
    if (!okDept) return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
