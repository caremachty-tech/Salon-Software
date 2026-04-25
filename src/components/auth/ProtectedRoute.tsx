import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedStaffRoute = ({ children }: { children: React.ReactNode }) => {
  const session = localStorage.getItem("staff_session");
  if (!session) return <Navigate to="/staff/login" replace />;
  return <>{children}</>;
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, salon, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Mandatory salon profile setup for owners
  if (profile?.role === "owner" && (!salon || !salon.is_profile_complete) && location.pathname !== "/dashboard/setup") {
    return <Navigate to="/dashboard/setup" replace />;
  }

  return <>{children}</>;
};
