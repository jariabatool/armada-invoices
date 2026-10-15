import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/auth/useAuth";
import { LoadingState } from "../components/ui/LoadingState";

/** Renders child routes only for signed-in users; otherwise redirects to /login. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <LoadingState message="Restoring your session…" />;
  if (status === "unauthenticated") return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
