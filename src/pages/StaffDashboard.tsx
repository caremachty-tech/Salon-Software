import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Star, LogOut, Calendar, Clock } from "lucide-react";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

type Appointment = {
  id: string;
  scheduled_at: string;
  status: string;
  total_price: number;
  customers: { name: string } | null;
  services: { name: string; duration_min: number } | null;
};

type StaffRecord = {
  id: string;
  name: string;
  role: string;
  rating: number;
  jobs_count: number;
  mtd_earnings: number;
  commission_pct: number;
};

const statusColor: Record<string, string> = {
  confirmed: "border-success/30 text-success",
  pending: "border-warning/40 text-warning",
  completed: "border-primary/30 text-primary",
  cancelled: "border-destructive/40 text-destructive",
};

const StaffDashboard = () => {
  const nav = useNavigate();
  const session = JSON.parse(localStorage.getItem("staff_session") ?? "null") as { id: string; name: string; email: string } | null;
  const [staffRecord, setStaffRecord] = useState<StaffRecord | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.id) { nav("/staff/login"); return; }
    const load = async () => {
      const { data: staff } = await supabase.from("staff").select("*").eq("id", session.id).single();
      setStaffRecord(staff as StaffRecord);
      if (staff?.id) {
        const { data: appts } = await supabase
          .from("appointments")
          .select("id, scheduled_at, status, total_price, customers(name), services(name, duration_min)")
          .eq("staff_id", staff.id)
          .order("scheduled_at", { ascending: false })
          .limit(50);
        setAppointments((appts ?? []) as unknown as Appointment[]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("staff_session");
    toast.success("Signed out.");
    nav("/staff/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  const upcoming = appointments.filter(a => a.status !== "cancelled" && new Date(a.scheduled_at) >= new Date());
  const past = appointments.filter(a => a.status === "completed" || new Date(a.scheduled_at) < new Date());

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">{staffRecord?.name}</span>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
        {/* Profile card */}
        <div className="glass-card rounded-xl p-6 flex items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-gradient-gold grid place-items-center text-primary-foreground text-2xl font-semibold font-display shrink-0">
            {staffRecord?.name?.[0] ?? "?"}
          </div>
          <div className="flex-1">
            <h2 className="font-display text-3xl text-foreground">{staffRecord?.name}</h2>
            <p className="text-sm text-muted-foreground">{staffRecord?.role}</p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Rating</p>
              <p className="font-display text-2xl text-foreground flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />{staffRecord?.rating?.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Jobs</p>
              <p className="font-display text-2xl text-foreground">{staffRecord?.jobs_count}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">MTD</p>
              <p className="font-display text-2xl text-gradient-gold">₹{staffRecord?.mtd_earnings?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="space-y-3">
          <h3 className="font-display text-xl text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Upcoming ({upcoming.length})
          </h3>
          {upcoming.length === 0 && (
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground text-sm">No upcoming appointments.</div>
          )}
          {upcoming.map(a => (
            <AppointmentRow key={a.id} appt={a} />
          ))}
        </div>

        {/* Past appointments */}
        <div className="space-y-3">
          <h3 className="font-display text-xl text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" /> Past appointments
          </h3>
          {past.length === 0 && (
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground text-sm">No past appointments.</div>
          )}
          {past.slice(0, 20).map(a => (
            <AppointmentRow key={a.id} appt={a} />
          ))}
        </div>
      </main>
    </div>
  );
};

const AppointmentRow = ({ appt }: { appt: Appointment }) => {
  const date = new Date(appt.scheduled_at);
  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
      <div className="text-center w-14 shrink-0">
        <p className="text-xs text-muted-foreground">{date.toLocaleDateString("en", { month: "short" })}</p>
        <p className="font-display text-2xl text-foreground leading-none">{date.getDate()}</p>
        <p className="text-xs text-muted-foreground">{date.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground font-medium truncate">{appt.customers?.name ?? "Walk-in"}</p>
        <p className="text-xs text-muted-foreground">{appt.services?.name} · {appt.services?.duration_min} min</p>
      </div>
      <div className="text-right shrink-0 space-y-1">
        <p className="text-foreground font-medium">₹{appt.total_price}</p>
        <Badge variant="outline" className={`text-xs ${statusColor[appt.status] ?? ""}`}>{appt.status}</Badge>
      </div>
    </div>
  );
};

export default StaffDashboard;
