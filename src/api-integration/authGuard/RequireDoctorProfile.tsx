import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDoctorProfileMeQuery } from "@/api-integration/queries/doctors";
import { useIsAuthenticated, useUser } from "@/api-integration/redux/selectors";

export default function RequireDoctorProfile() {
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  if (!isAuthenticated || !user) return null;
  const role = user.roles?.[0];
  if (role !== "doctor") return <Outlet />;
  if (location.pathname.includes("/")) return <Outlet />;
  const { data, isLoading, isError } = useDoctorProfileMeQuery(true);
  if (isLoading) return null;
  if (isError || !data) return <Navigate to="/" replace state={{ from: location }} />;
  return <Outlet />;
}
