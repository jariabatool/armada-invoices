import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/auth/useAuth";
import { LoadingState } from "../components/ui/LoadingState";

/** For pages like /login: signed-in users are sent to the app. */
export function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === "loading") return <LoadingState message="Restoring your session…" />;
  if (status === "authenticated") return <Navigate to="/invoices" replace />;
  return <Outlet />;
}
