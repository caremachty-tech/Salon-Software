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
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wait until profile has loaded before making any redirect decisions
  if (!profile) return <>{children}</>;

  // Only redirect to setup when salon is confirmed loaded AND incomplete
  const isSetupPage = location.pathname === "/dashboard/setup";
  if (profile.role === "owner" && salon !== null && !salon.is_profile_complete && !isSetupPage) {
    return <Navigate to="/dashboard/setup" replace />;
  }

  return <>{children}</>;
};
