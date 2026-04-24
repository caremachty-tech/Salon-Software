import { NavLink, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Users, Package, BarChart3, Receipt,
  Megaphone, Heart, Building2, Settings, Bell, Search, LogOut,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/calendar", label: "Appointments", icon: Calendar },
  { to: "/dashboard/staff", label: "Staff", icon: Users },
  { to: "/dashboard/customers", label: "Customers", icon: Heart },
  { to: "/dashboard/inventory", label: "Inventory", icon: Package },
  { to: "/dashboard/billing", label: "Billing & POS", icon: Receipt },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/marketing", label: "Marketing", icon: Megaphone },
  { to: "/dashboard/branches", label: "Branches", icon: Building2 },
];

export const DashboardLayout = () => {
  const loc = useLocation();
  const nav2 = useNavigate();
  const { user, profile, salon, signOut } = useAuth();
  const current = nav.find((n) => (n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)));
  const initials = (user?.user_metadata?.full_name as string)?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U";

  const handleSignOut = async () => { await signOut(); nav2("/login"); };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Logo />
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-0.5">
          <div className="px-3 py-2 mb-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Logged in as</p>
            <p className="text-xs text-foreground font-medium truncate">{profile?.full_name || user?.email}</p>
            <Badge variant="outline" className="mt-1 text-[9px] h-4 uppercase">{profile?.role}</Badge>
          </div>
          <NavLink to="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent">
            <Settings className="h-4 w-4" /> Settings
          </NavLink>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-4 md:px-8 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{salon?.name || "Mane Magic Studio"}</p>
            <h1 className="font-display text-xl text-foreground -mt-0.5">{current?.label ?? "Dashboard"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 w-64 bg-surface" placeholder="Search clients, services…" />
            </div>
            <Button size="icon" variant="ghost" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>
            <div className="h-9 w-9 rounded-full bg-gradient-gold grid place-items-center text-primary-foreground text-sm font-semibold">{initials}</div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
