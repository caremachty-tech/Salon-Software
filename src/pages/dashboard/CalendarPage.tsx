import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Phone, Mail, Scissors, Trash2 } from "lucide-react";
import { useData } from "@/context/DataContext";
import { Appointment } from "@/context/DataContext";
import { format } from "date-fns";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const statusStyle: Record<string, string> = {
  confirmed: "border-success/40 text-success",
  pending: "border-warning/30 text-warning",
  cancelled: "border-destructive/40 text-destructive",
  completed: "border-muted-foreground/30 text-muted-foreground",
};

const CalendarPage = () => {
  const { staff, appointments, customers, services, loading, refresh } = useData();
  const { salon } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [form, setForm] = useState({ customer_id: "", staff_id: "", service_id: "", scheduled_at: "", status: "confirmed" });

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

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Appointment deleted.");
    setSelected(null);
    refresh();
  };

  if (loading) return <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="flex gap-4 py-3 border-b border-border/30 animate-pulse"><div className="h-4 bg-muted rounded w-1/4"/><div className="h-4 bg-muted rounded w-1/4"/><div className="h-4 bg-muted rounded w-1/4"/><div className="h-4 bg-muted rounded w-1/4"/></div>)}</div>;

  const confirmed = appointments.filter((a) => a.status === "confirmed").length;
  const pending = appointments.filter((a) => a.status === "pending").length;
  const liveAppointments = appointments.filter((a) => {
    if (a.status !== "confirmed" && a.status !== "pending") return false;
    if (new Date(a.scheduled_at) < new Date()) return false;
    const date = a.scheduled_at.split("T")[0];
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-foreground">Appointments</h2>
          <p className="text-sm text-muted-foreground">Upcoming appointments across all chairs.</p>
        </div>
        <Button variant="hero" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New booking</Button>
      </div>

      {/* Summary badges + date filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3 text-xs">
          <Badge variant="outline" className="border-primary/30">{liveAppointments.length} total</Badge>
          <Badge variant="outline" className="border-success/40 text-success">{confirmed} confirmed</Badge>
          <Badge variant="outline" className="border-warning/30 text-warning">{pending} pending</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" className="bg-surface w-36 h-8 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className="text-muted-foreground text-sm">to</span>
          <Input type="date" className="bg-surface w-36 h-8 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
          {(from || to) && <button onClick={() => { setFrom(""); setTo(""); }} className="text-xs text-muted-foreground hover:text-destructive">✕</button>}
        </div>
      </div>

      {/* Appointments table */}
      <div className="glass-card rounded-xl p-6">
        <p className="text-xs text-muted-foreground mb-4">Click a row to view customer details</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/50">
                <th className="text-left py-3 font-medium">Date & Time</th>
                <th className="text-left py-3 font-medium">Client</th>
                <th className="text-left py-3 font-medium">Service</th>
                <th className="text-left py-3 font-medium">Stylist</th>
                <th className="text-left py-3 font-medium">Total</th>
                <th className="text-left py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {liveAppointments.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground text-sm">No appointments yet. Book one!</td></tr>}
              {liveAppointments.map((a) => (
                <tr key={a.id} onClick={() => setSelected(a)} className="border-b border-border/30 hover:bg-surface/50 transition-colors cursor-pointer">
                  <td className="py-3 font-mono text-primary text-xs">{format(new Date(a.scheduled_at), "MMM d, yyyy · HH:mm")}</td>
                  <td className="py-3 text-foreground">{a.customers?.name ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{a.services?.name ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{a.staff?.name ?? "—"}</td>
                  <td className="py-3 text-foreground">{a.total_price ? `₹${a.total_price}` : "—"}</td>
                  <td className="py-3"><Badge variant="outline" className={statusStyle[a.status] ?? "border-muted-foreground/30 text-muted-foreground"}>{a.status}</Badge></td>
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
                  <Badge variant="outline" className={statusStyle[selected.status] ?? ""}>{selected.status}</Badge>
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
                  <p className="font-display text-xl text-gradient-gold">{selected.total_price ? `₹${selected.total_price}` : "—"}</p>
                </div>
                <Button variant="outline" className="w-full border-destructive/40 text-destructive hover:bg-destructive/10" disabled={deleting} onClick={() => handleDelete(selected.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />{deleting ? "Deleting…" : "Delete appointment"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

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
                <SelectContent>{services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} — ₹{s.price}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Date & time</Label><Input required type="datetime-local" value={form.scheduled_at} onChange={(e) => set("scheduled_at", e.target.value)} /></div>
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
