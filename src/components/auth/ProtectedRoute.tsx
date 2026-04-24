import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedStaffRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  if (!user) return <Navigate to="/staff/login" replace />;
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
