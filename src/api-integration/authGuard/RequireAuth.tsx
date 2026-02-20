import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "@/api-integration/types/types";
import { useIsAuthenticated, useUser } from "@/api-integration/redux/selectors";

interface RequireAuthProps {
  roles?: Role[];
}

export default function RequireAuth({ roles }: RequireAuthProps) {
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length) {
    const hasRole = user?.roles?.some((r: Role) => roles.includes(r));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
