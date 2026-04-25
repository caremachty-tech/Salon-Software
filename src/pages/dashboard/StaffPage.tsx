import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Star, Plus, Mail, Lock, Eye, EyeOff, Users, Trash2 } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Staff } from "@/context/DataContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";

const StaffPage = () => {
  const { staff, loading, refresh } = useData();
  const { salon } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onDeleteStaff = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this staff member? This cannot be undone.")) return;
    setDeletingId(id);
    const { error } = await supabase.from("staff").delete().eq("id", id);
    setDeletingId(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Staff member deleted.");
    refresh();
  };
  const [form, setForm] = useState({ name: "", role: "", email: "", password: "", rating: "5.0", commission_pct: "35" });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setSaving(true);
    const { error } = await supabase.from("staff").insert({
      name: form.name, role: form.role, email: form.email,
      password_hash: form.password,
      rating: parseFloat(form.rating),
      commission_pct: parseInt(form.commission_pct),
      jobs_count: 0, mtd_earnings: 0,
      salon_id: salon?.id ?? null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${form.name} added. They can log in with ${form.email}.`);
    setOpen(false);
    setForm({ name: "", role: "", email: "", password: "", rating: "5.0", commission_pct: "35" });
    refresh();
  };

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1,2,3].map(i => <div key={i} className="glass-card rounded-xl overflow-hidden animate-pulse"><div className="aspect-[4/3] bg-muted" /><div className="p-5 space-y-2"><div className="h-5 bg-muted rounded w-2/3" /><div className="h-3 bg-muted rounded w-1/3" /></div></div>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-foreground">Staff</h2>
          <p className="text-sm text-muted-foreground">Manage your team, earnings, and commissions.</p>
        </div>
        <Button variant="hero" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add staff</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staff.length === 0 && (
          <div className="col-span-3 glass-card rounded-xl p-10 text-center text-muted-foreground text-sm">No staff yet. Add your first team member.</div>
        )}
        {staff.map((s) => (
          <div
            key={s.id}
            onClick={() => setSelected(s)}
            className="glass-card rounded-xl overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-1 group cursor-pointer relative"
          >
            {s.img_url ? (
              <div className="aspect-[4/3] overflow-hidden bg-surface">
                <img src={s.img_url} alt={s.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            ) : (
              <div className="aspect-[4/3] bg-surface flex items-center justify-center">
                <span className="h-20 w-20 rounded-full bg-gradient-gold text-primary-foreground grid place-items-center text-3xl font-semibold font-display">{s.name[0]}</span>
              </div>
            )}
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-2xl text-foreground">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">{s.role}</p>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  <Star className="h-3 w-3 mr-1 fill-primary" /> {s.rating}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center">
                <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Jobs</p><p className="font-display text-xl text-foreground">{s.jobs_count}</p></div>
                <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">MTD</p><p className="font-display text-xl text-gradient-gold">₹{s.mtd_earnings.toLocaleString()}</p></div>
                <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Comm</p><p className="font-display text-xl text-foreground">{s.commission_pct}%</p></div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to view customers</p>
              <button
                onClick={(e) => onDeleteStaff(s.id, e)}
                disabled={deletingId === s.id}
                className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-background/80 border border-border/50 grid place-items-center text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <StaffCustomersSheet staff={selected} onClose={() => setSelected(null)} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display text-2xl">Add staff member</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Full name</Label><Input required placeholder="Maya Chen" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Role / Title</Label><Input required placeholder="Master Colorist" value={form.role} onChange={(e) => set("role", e.target.value)} /></div>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Login email</Label>
              <Input required type="email" placeholder="maya@salon.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Password</Label>
              <div className="relative">
                <Input required type={showPw ? "text" : "password"} placeholder="Min 6 characters" value={form.password} onChange={(e) => set("password", e.target.value)} className="pr-9" />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Rating (0–5)</Label><Input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => set("rating", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Commission %</Label><Input type="number" min="0" max="100" value={form.commission_pct} onChange={(e) => set("commission_pct", e.target.value)} /></div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={saving}>{saving ? "Creating…" : "Add staff"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

type StaffAppointment = {
  id: string; scheduled_at: string; total_price: number; status: string; notes: string | null;
  customers: { name: string; phone: string | null } | null;
  services: { name: string } | null;
};

const statusColor: Record<string, string> = {
  confirmed: "border-success/30 text-success", pending: "border-warning/40 text-warning",
  completed: "border-primary/30 text-primary", cancelled: "border-destructive/40 text-destructive",
};

const StaffCustomersSheet = ({ staff, onClose }: { staff: Staff | null; onClose: () => void }) => {
  const [records, setRecords] = useState<StaffAppointment[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  useEffect(() => {
    if (!staff) return;
    setHistLoading(true);
    supabase.from("appointments")
      .select("id, scheduled_at, total_price, status, notes, customers(name, phone), services(name)")
      .eq("staff_id", staff.id)
      .order("scheduled_at", { ascending: false })
      .then(({ data }) => { setRecords((data ?? []) as unknown as StaffAppointment[]); setHistLoading(false); });
  }, [staff?.id]);

  const totalEarned = records.reduce((s, r) => s + (r.status !== "cancelled" ? r.total_price : 0), 0);
  const uniqueCustomers = new Set(records.map((r) => r.customers?.name).filter(Boolean)).size;

  return (
    <Sheet open={!!staff} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        {staff && (
          <>
            <SheetHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <span className="h-12 w-12 rounded-full bg-gradient-gold grid place-items-center text-primary-foreground text-xl font-semibold font-display shrink-0">{staff.name[0]}</span>
                <div><SheetTitle className="font-display text-2xl">{staff.name}</SheetTitle><p className="text-xs text-muted-foreground">{staff.role}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 text-center">
                <div className="glass-card rounded-lg p-2"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Customers</p><p className="font-display text-xl text-foreground">{uniqueCustomers}</p></div>
                <div className="glass-card rounded-lg p-2"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total earned</p><p className="font-display text-xl text-gradient-gold">₹{totalEarned.toLocaleString()}</p></div>
                <div className="glass-card rounded-lg p-2"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Rating</p><p className="font-display text-xl text-foreground flex items-center justify-center gap-1"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{staff.rating.toFixed(1)}</p></div>
              </div>
            </SheetHeader>
            <div className="pt-4 space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Customer history</p>
              {histLoading && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>}
              {!histLoading && records.length === 0 && <div className="glass-card rounded-xl p-8 text-center text-muted-foreground text-sm">No customer records yet.</div>}
              {!histLoading && records.map((r) => (
                <div key={r.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                  <div className="text-center w-12 shrink-0">
                    <p className="text-xs text-muted-foreground">{format(new Date(r.scheduled_at), "MMM")}</p>
                    <p className="font-display text-2xl text-foreground leading-none">{format(new Date(r.scheduled_at), "d")}</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(r.scheduled_at), "yyyy")}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate">{r.customers?.name ?? "Walk-in"}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.services?.name ?? r.notes ?? "Product purchase"}</p>
                    {r.customers?.phone && <p className="text-xs text-muted-foreground">{r.customers.phone}</p>}
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-foreground font-medium">₹{r.total_price.toFixed(2)}</p>
                    <Badge variant="outline" className={`text-xs ${statusColor[r.status] ?? ""}`}>{r.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default StaffPage;
