import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, Users, Calendar, TrendingUp, Trash2, Phone, Mail, Scissors } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useData } from "@/context/DataContext";
import { Appointment } from "@/context/DataContext";
import { SkeletonStat, SkeletonRow } from "@/components/dashboard/Skeletons";
import { format } from "date-fns";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const peak = [
  { h: "9a", b: 4 }, { h: "10a", b: 7 }, { h: "11a", b: 9 }, { h: "12p", b: 12 },
  { h: "1p", b: 8 }, { h: "2p", b: 11 }, { h: "3p", b: 14 }, { h: "4p", b: 16 },
  { h: "5p", b: 18 }, { h: "6p", b: 13 }, { h: "7p", b: 7 },
];

const statusColor: Record<string, string> = {
  confirmed: "border-success/40 text-success",
  pending: "border-warning/30 text-warning",
};

const Overview = () => {
  const { revenue, appointments, customers, loading, refresh } = useData();
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter(
    (a) => a.scheduled_at.startsWith(today) && (a.status === "confirmed" || a.status === "pending")
  );
  const todayRevenue = revenue.find((r) => r.date === today)?.amount ?? 0;
  const avgTicket = todayAppointments.length
    ? Math.round(todayAppointments.reduce((s, a) => s + (a.total_price ?? 0), 0) / todayAppointments.length)
    : 0;
  const newClients = customers.filter((c) => c.last_visit_at?.startsWith(today)).length;
  const chartData = revenue.slice(-7).map((r) => ({ d: format(new Date(r.date), "EEE"), v: r.amount }));

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Appointment deleted.");
    setSelected(null);
    refresh();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {loading ? <><SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat /></> : <>
          <StatCard label="Today's Revenue" value={`₹${todayRevenue.toLocaleString()}`} delta="live" icon={<DollarSign className="h-4 w-4" />} />
          <StatCard label="Appointments" value={String(todayAppointments.length)} delta="today" icon={<Calendar className="h-4 w-4" />} />
          <StatCard label="New Clients" value={String(newClients)} delta="today" icon={<Users className="h-4 w-4" />} />
          <StatCard label="Avg Ticket" value={`₹${avgTicket}`} delta="today" icon={<TrendingUp className="h-4 w-4" />} />
        </>}
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
            <AreaChart data={chartData}>
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
        <h3 className="font-display text-2xl text-foreground mb-1">Today's appointments</h3>
        <p className="text-xs text-muted-foreground mb-4">Click a row to view details · Live schedule</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/50">
                <th className="text-left py-3 font-medium">Time</th>
                <th className="text-left py-3 font-medium">Client</th>
                <th className="text-left py-3 font-medium">Service</th>
                <th className="text-left py-3 font-medium">Stylist</th>
                <th className="text-left py-3 font-medium">Status</th>
                <th className="text-right py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading && [1,2,3].map(i => <tr key={i}><td colSpan={6}><SkeletonRow /></td></tr>)}
              {!loading && todayAppointments.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground text-sm">No appointments today.</td></tr>}
              {todayAppointments.map((a) => (
                <tr key={a.id} onClick={() => setSelected(a)} className="border-b border-border/30 hover:bg-surface/50 transition-colors cursor-pointer">
                  <td className="py-3 font-mono text-primary">{format(new Date(a.scheduled_at), "HH:mm")}</td>
                  <td className="py-3 text-foreground">{a.customers?.name ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{a.services?.name ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{a.staff?.name ?? "—"}</td>
                  <td className="py-3"><Badge variant="outline" className={`text-xs ${statusColor[a.status] ?? ""}`}>{a.status}</Badge></td>
                  <td className="py-3 text-right text-foreground font-medium">₹{a.total_price ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment detail sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-sm">
          {selected && (
            <>
              <SheetHeader className="pb-4 border-b border-border/40">
                <div className="flex items-start justify-between">
                  <SheetTitle className="font-display text-2xl">Appointment</SheetTitle>
                  <Badge variant="outline" className={`text-xs ${statusColor[selected.status] ?? ""}`}>{selected.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{format(new Date(selected.scheduled_at), "MMM d, yyyy · HH:mm")}</p>
              </SheetHeader>
              <div className="pt-5 space-y-5">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Customer</p>
                  <div className="glass-card rounded-xl p-4 space-y-2">
                    <p className="text-foreground font-medium">{selected.customers?.name ?? "—"}</p>
                    {selected.customers?.phone && <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{selected.customers.phone}</p>}
                    {selected.customers?.email && <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{selected.customers.email}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Service</p>
                  <div className="glass-card rounded-xl p-4 space-y-1">
                    <p className="text-foreground font-medium flex items-center gap-2"><Scissors className="h-3.5 w-3.5 text-primary" />{selected.services?.name ?? "—"}</p>
                    {selected.services?.duration_min && <p className="text-xs text-muted-foreground">{selected.services.duration_min} min</p>}
                    {selected.staff?.name && <p className="text-xs text-muted-foreground">Stylist: {selected.staff.name}</p>}
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4 flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-display text-xl text-gradient-gold">₹{selected.total_price}</p>
                </div>
                <Button variant="outline" className="w-full border-destructive/40 text-destructive hover:bg-destructive/10" disabled={deleting} onClick={() => handleDelete(selected.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />{deleting ? "Deleting…" : "Delete appointment"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Overview;
