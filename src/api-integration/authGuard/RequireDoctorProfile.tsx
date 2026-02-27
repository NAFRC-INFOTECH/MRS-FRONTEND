import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDoctorProfileMeQuery } from "@/api-integration/queries/doctors";

export default function RequireDoctorProfile() {
  const location = useLocation();
  const { data, isLoading, isError } = useDoctorProfileMeQuery();
  if (isLoading) return null;
  if (isError || !data) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
