import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, Users, Calendar, TrendingUp, UserPlus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import WalkInModal from "@/components/dashboard/WalkInModal";

const peak = [
  { h: "9a", b: 4 }, { h: "10a", b: 7 }, { h: "11a", b: 9 }, { h: "12p", b: 12 },
  { h: "1p", b: 8 }, { h: "2p", b: 11 }, { h: "3p", b: 14 }, { h: "4p", b: 16 },
  { h: "5p", b: 18 }, { h: "6p", b: 13 }, { h: "7p", b: 7 },
];

type Appointment = {
  id: string;
  scheduled_at: string;
  total_price: number;
  customers: { name: string } | null;
  services: { name: string } | null;
  staff: { name: string } | null;
};

type RevenueDay = { date: string; amount: number };

const Overview = () => {
  const { salon } = useAuth();
  const [revenue, setRevenue] = useState<{ d: string; v: number }[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [apptCount, setApptCount] = useState(0);
  const [newClients, setNewClients] = useState(0);
  const [avgTicket, setAvgTicket] = useState(0);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  const fetchData = async () => {
    if (!salon?.id) return;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data: rev } = await supabase
      .from("revenue_daily")
      .select("date, amount")
      .eq("salon_id", salon.id)
      .order("date", { ascending: true })
      .limit(7);
    if (rev) {
      setRevenue((rev as RevenueDay[]).map((r) => ({ d: format(new Date(r.date), "EEE"), v: r.amount })));
      const todayRow = (rev as RevenueDay[]).find((r) => {
        const rowDate = new Date(r.date);
        return rowDate >= startOfDay && rowDate <= endOfDay;
      });
      setTodayRevenue(todayRow?.amount ?? 0);
    }

    const { data: appts } = await supabase
      .from("appointments")
      .select("id, scheduled_at, total_price, customers(name), services(name), staff(name)")
      .eq("salon_id", salon.id)
      .gte("scheduled_at", startOfDay.toISOString())
      .lte("scheduled_at", endOfDay.toISOString())
      .order("scheduled_at", { ascending: true });
    if (appts) {
      setAppointments(appts as unknown as Appointment[]);
      setApptCount(appts.length);
      const prices = (appts as { total_price: number }[]).map((a) => a.total_price ?? 0).filter(Boolean);
      setAvgTicket(prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0);
    }

    const { count } = await supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("salon_id", salon.id)
      .gte("created_at", startOfDay.toISOString());
    setNewClients(count ?? 0);
  };

  useEffect(() => {
    fetchData();
  }, [salon?.id]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-foreground">Overview</h2>
          <p className="text-sm text-muted-foreground">Live intelligence for {salon?.name}.</p>
        </div>
        <Button variant="hero" onClick={() => setIsWalkInModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Register Walk-in
        </Button>
      </div>

      <WalkInModal 
        open={isWalkInModalOpen} 
        onOpenChange={setIsWalkInModalOpen} 
        onSuccess={fetchData} 
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Revenue" value={`₹${todayRevenue.toLocaleString()}`} delta="live" icon={<DollarSign className="h-4 w-4" />} />
        <StatCard label="Appointments" value={String(apptCount)} delta="today" icon={<Calendar className="h-4 w-4" />} />
        <StatCard label="New Clients" value={String(newClients)} delta="today" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Avg Ticket" value={`₹${avgTicket}`} delta="today" icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-2xl text-foreground">Revenue this week</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">Live</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="d" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="font-display text-2xl text-foreground mb-1">Peak hours</h3>
          <p className="text-xs text-muted-foreground mb-4">Predicted bookings today</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={peak}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="h" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="b" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-2xl text-foreground">Today's appointments</h3>
            <p className="text-xs text-muted-foreground">Live schedule across all chairs</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/50">
                <th className="text-left py-3 font-medium">Time</th>
                <th className="text-left py-3 font-medium">Client</th>
                <th className="text-left py-3 font-medium">Service</th>
                <th className="text-left py-3 font-medium">Stylist</th>
                <th className="text-right py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground text-sm">No appointments today.</td></tr>
              )}
              {appointments.map((a) => (
                <tr key={a.id} className="border-b border-border/30 hover:bg-surface/50 transition-colors">
                  <td className="py-3 font-mono text-primary">{format(new Date(a.scheduled_at), "HH:mm")}</td>
                  <td className="py-3 text-foreground">{a.customers?.name ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{a.services?.name ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{a.staff?.name ?? "—"}</td>
                  <td className="py-3 text-right text-foreground font-medium">{a.total_price ? `₹${a.total_price}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
