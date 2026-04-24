import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Clock, CalendarDays } from "lucide-react";
import { useData } from "@/context/DataContext";
import { format, isToday, isFuture, isPast } from "date-fns";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const statusStyle: Record<string, string> = {
  confirmed: "border-success/40 text-success bg-success/10",
  pending: "border-warning/30 text-warning bg-warning/10",
  cancelled: "border-destructive/40 text-destructive bg-destructive/10",
  completed: "border-muted-foreground/30 text-muted-foreground",
};

const CalendarPage = () => {
  const { staff, appointments, customers, services, loading, refresh } = useData();
  const { salon } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_id: "", staff_id: "", service_id: "",
    scheduled_at: "", status: "confirmed",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const svc = services.find((s) => s.id === form.service_id);
    const { error } = await supabase.from("appointments").insert({
      customer_id: form.customer_id || null,
      staff_id: form.staff_id || null,
      service_id: form.service_id || null,
      scheduled_at: form.scheduled_at,
      status: form.status,
      total_price: svc?.price ?? null,
      salon_id: salon?.id ?? null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Appointment booked.");
    setOpen(false);
    setForm({ customer_id: "", staff_id: "", service_id: "", scheduled_at: "", status: "confirmed" });
    refresh();
  };

  // Split into live (today) and upcoming (future)
  const liveAppointments = appointments.filter((a) => isToday(new Date(a.scheduled_at)));
  const upcomingAppointments = appointments.filter((a) => isFuture(new Date(a.scheduled_at)) && !isToday(new Date(a.scheduled_at)));
  const pastAppointments = appointments.filter((a) => isPast(new Date(a.scheduled_at)) && !isToday(new Date(a.scheduled_at)));

  const AppointmentRow = ({ a }: { a: typeof appointments[0] }) => (
    <div className="flex items-center gap-4 py-4 border-b border-border/30 hover:bg-surface/40 transition-colors px-2 rounded-lg">
      <div className="text-center min-w-[60px]">
        <p className="font-mono text-primary text-sm font-medium">{format(new Date(a.scheduled_at), "HH:mm")}</p>
        <p className="text-[10px] text-muted-foreground">{format(new Date(a.scheduled_at), "MMM d")}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground font-medium truncate">{a.customers?.name ?? "Walk-in"}</p>
        <p className="text-xs text-muted-foreground truncate">{a.services?.name ?? "—"}</p>
      </div>
      <div className="hidden sm:block text-sm text-muted-foreground min-w-[80px]">
        {a.staff?.name ?? "—"}
      </div>
      <div className="text-sm font-medium text-foreground min-w-[50px] text-right">
        {a.total_price ? `$${a.total_price}` : "—"}
      </div>
      <Badge variant="outline" className={statusStyle[a.status] ?? "border-muted-foreground/30"}>
        {a.status}
      </Badge>
    </div>
  );

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="flex gap-4 py-4 border-b border-border/30 animate-pulse">
          <div className="h-10 w-14 bg-muted rounded" />
          <div className="flex-1 space-y-2"><div className="h-4 bg-muted rounded w-1/3" /><div className="h-3 bg-muted rounded w-1/4" /></div>
          <div className="h-4 bg-muted rounded w-16" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-foreground">Appointments</h2>
          <p className="text-sm text-muted-foreground">Live and upcoming bookings.</p>
        </div>
        <Button variant="hero" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New booking
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Today</p>
          <p className="font-display text-3xl text-foreground">{liveAppointments.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Upcoming</p>
          <p className="font-display text-3xl text-primary">{upcomingAppointments.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Total</p>
          <p className="font-display text-3xl text-foreground">{appointments.length}</p>
        </div>
      </div>

      {/* Today's appointments */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="font-display text-xl text-foreground">Today · {format(new Date(), "EEEE, MMMM d")}</h3>
          <Badge variant="outline" className="border-primary/30 text-primary ml-auto">{liveAppointments.length} appointments</Badge>
        </div>
        {liveAppointments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No appointments today.</p>
        ) : (
          liveAppointments.map((a) => <AppointmentRow key={a.id} a={a} />)
        )}
      </div>

      {/* Upcoming appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h3 className="font-display text-xl text-foreground">Upcoming</h3>
            <Badge variant="outline" className="border-primary/30 text-primary ml-auto">{upcomingAppointments.length}</Badge>
          </div>
          {upcomingAppointments.map((a) => <AppointmentRow key={a.id} a={a} />)}
        </div>
      )}

      {/* Past appointments */}
      {pastAppointments.length > 0 && (
        <div className="glass-card rounded-xl p-6 opacity-70">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-display text-xl text-foreground">Past</h3>
            <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground ml-auto">{pastAppointments.length}</Badge>
          </div>
          {pastAppointments.slice(0, 5).map((a) => <AppointmentRow key={a.id} a={a} />)}
        </div>
      )}

      {/* New booking modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display text-2xl">New booking</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Customer</Label>
              <Select value={form.customer_id} onValueChange={(v) => set("customer_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Stylist</Label>
              <Select value={form.staff_id} onValueChange={(v) => set("staff_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select stylist" /></SelectTrigger>
                <SelectContent>{staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Service</Label>
              <Select value={form.service_id} onValueChange={(v) => set("service_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                <SelectContent>{services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} — ${s.price}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date & time</Label>
              <Input required type="datetime-local" value={form.scheduled_at} onChange={(e) => set("scheduled_at", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={saving}>{saving ? "Saving…" : "Book appointment"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
