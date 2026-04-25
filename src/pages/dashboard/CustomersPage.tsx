import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Scissors, ChevronRight, Search, Phone, Mail, Trash2, Gift } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Customer } from "@/context/DataContext";
import { formatDistanceToNow, format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const CustomersPage = () => {
  const { customers, loading, refresh } = useData();
  const { salon } = useAuth();

  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "" });
  const [selected, setSelected] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const setA = (k: string, v: string) => setAddForm((p) => ({ ...p, [k]: v }));

  const onAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.phone.trim()) { toast.error("Phone number is required."); return; }
    const { data: existing } = await supabase.from("customers").select("id").eq("phone", addForm.phone.trim()).maybeSingle();
    if (existing) { toast.error("A customer with this phone number already exists."); return; }
    setAddSaving(true);
    const { error } = await supabase.from("customers").insert({
      name: addForm.name, email: addForm.email || null,
      phone: addForm.phone.trim(),
      tag: "Regular", visits: 0, lifetime_spend: 0, loyalty_points: 0,
      salon_id: salon?.id ?? null,
    });
    setAddSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Customer added.");
    setAddOpen(false);
    setAddForm({ name: "", email: "", phone: "" });
    refresh();
  };

  const onDeleteCustomer = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("customers").delete().eq("id", id);
    setDeletingId(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Customer deleted.");
    refresh();
  };

  const filteredCustomers = customers.filter((c) => {
    const date = c.last_visit_at?.split("T")[0] ?? "";
    if (from && date && date < from) return false;
    if (to && date && date > to) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !(c.phone ?? "").includes(search)) return false;
    return true;
  });

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-xl p-6 space-y-3">
        {[1,2,3,4].map(i => <div key={i} className="flex gap-4 py-3 border-b border-border/30 animate-pulse"><div className="h-4 bg-muted rounded w-1/4"/><div className="h-4 bg-muted rounded w-1/4"/><div className="h-4 bg-muted rounded w-1/4"/><div className="h-4 bg-muted rounded w-1/4"/></div>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-foreground">Customers</h2>
          <p className="text-sm text-muted-foreground">Visit history and service records.</p>
        </div>
        <Button variant="hero" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add customer</Button>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or phone…" className="pl-9 bg-surface" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Input type="date" className="bg-surface w-36" value={from} onChange={(e) => setFrom(e.target.value)} />
            <span className="text-muted-foreground text-sm">to</span>
            <Input type="date" className="bg-surface w-36" value={to} onChange={(e) => setTo(e.target.value)} />
            {(from || to) && <button onClick={() => { setFrom(""); setTo(""); }} className="text-xs text-muted-foreground hover:text-destructive">✕</button>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/50">
                <th className="text-left py-3 font-medium">Customer</th>
                <th className="text-left py-3 font-medium">Phone</th>
                <th className="text-left py-3 font-medium">Visits</th>
                <th className="text-left py-3 font-medium">Last visit</th>
                <th className="text-left py-3 font-medium">Lifetime spend</th>
                <th className="text-right py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground text-sm">No customers found.</td></tr>}
              {filteredCustomers.map((c) => (
                <tr key={c.id} onClick={() => setSelected(c)} className="border-b border-border/30 hover:bg-surface/50 cursor-pointer group">
                  <td className="py-3 text-foreground flex items-center gap-2">
                    <span className="h-7 w-7 rounded-full bg-gradient-gold grid place-items-center text-primary-foreground text-xs font-semibold shrink-0">{c.name[0]}</span>
                    {c.name}
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </td>
                  <td className="py-3 text-muted-foreground">{c.phone ?? "—"}</td>
                  <td className="py-3 text-muted-foreground">{c.visits}</td>
                  <td className="py-3 text-muted-foreground">{c.last_visit_at ? formatDistanceToNow(new Date(c.last_visit_at), { addSuffix: true }) : "—"}</td>
                  <td className="py-3 text-foreground">₹{c.lifetime_spend.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); onDeleteCustomer(c.id); }} disabled={deletingId === c.id} className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerHistoryDrawer customer={selected} onClose={() => setSelected(null)} />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display text-2xl">Add customer</DialogTitle></DialogHeader>
          <form onSubmit={onAddCustomer} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label>Full name <span className="text-destructive">*</span></Label><Input required placeholder="Olivia Park" value={addForm.name} onChange={(e) => setA("name", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Phone <span className="text-destructive">*</span></Label><Input required placeholder="+91 98765 43210" value={addForm.phone} onChange={(e) => setA("phone", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="olivia@example.com" value={addForm.email} onChange={(e) => setA("email", e.target.value)} /></div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={addSaving}>{addSaving ? "Saving…" : "Add customer"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

type HistoryAppointment = {
  id: string; scheduled_at: string; total_price: number; status: string; notes: string | null;
  services: { name: string; duration_min: number } | null;
  staff: { name: string } | null;
  customers: { name: string; phone: string | null; email: string | null } | null;
};

const statusColor: Record<string, string> = {
  confirmed: "border-success/30 text-success", pending: "border-warning/40 text-warning",
  completed: "border-primary/30 text-primary", cancelled: "border-destructive/40 text-destructive",
};

const CustomerHistoryDrawer = ({ customer, onClose }: { customer: Customer | null; onClose: () => void }) => {
  const [history, setHistory] = useState<HistoryAppointment[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = (customerId: string) => {
    setHistLoading(true);
    supabase.from("appointments")
      .select("id, scheduled_at, total_price, status, notes, services(name, duration_min), staff(name), customers(name, phone, email)")
      .eq("customer_id", customerId)
      .order("scheduled_at", { ascending: false })
      .then(({ data }) => { setHistory((data ?? []) as unknown as HistoryAppointment[]); setHistLoading(false); });
  };

  useEffect(() => { if (!customer) return; load(customer.id); }, [customer?.id]);

  const handleDelete = async (apptId: string, customerId: string) => {
    setDeleting(apptId);
    const { error } = await supabase.from("appointments").delete().eq("id", apptId);
    setDeleting(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Appointment deleted.");
    load(customerId);
  };

  const pending = history.filter((a) => a.status === "confirmed" || a.status === "pending");
  const completed = history.filter((a) => a.status === "completed");
  const totalSpent = completed.reduce((s, a) => s + (a.total_price ?? 0), 0);

  return (
    <Sheet open={!!customer} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        {customer && (
          <>
            <SheetHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <span className="h-12 w-12 rounded-full bg-gradient-gold grid place-items-center text-primary-foreground text-xl font-semibold font-display shrink-0">{customer.name[0]}</span>
                <div><SheetTitle className="font-display text-2xl">{customer.name}</SheetTitle></div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 text-center">
                <div className="glass-card rounded-lg p-2"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Visits</p><p className="font-display text-xl text-foreground">{customer.visits}</p></div>
                <div className="glass-card rounded-lg p-2"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Lifetime</p><p className="font-display text-xl text-gradient-gold">₹{customer.lifetime_spend.toLocaleString()}</p></div>
                <div className="glass-card rounded-lg p-2"><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Points</p><p className="font-display text-xl text-primary flex items-center justify-center gap-1"><Gift className="h-3.5 w-3.5" />{customer.loyalty_points ?? 0}</p></div>
              </div>
            </SheetHeader>

            <div className="pt-4 space-y-4">
              {(history[0]?.customers?.phone || history[0]?.customers?.email) && (
                <div className="glass-card rounded-xl p-3 space-y-1">
                  {history[0]?.customers?.phone && <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{history[0].customers.phone}</p>}
                  {history[0]?.customers?.email && <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{history[0].customers.email}</p>}
                </div>
              )}

              {histLoading && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>}

              {!histLoading && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Scissors className="h-3.5 w-3.5" /> Upcoming / Pending ({pending.length})</p>
                  {pending.length === 0 && <p className="text-sm text-muted-foreground glass-card rounded-xl p-4 text-center">No pending appointments.</p>}
                  {pending.map((a) => <AppointmentCard key={a.id} appt={a} onDelete={() => handleDelete(a.id, customer.id)} deleting={deleting === a.id} showDelete />)}
                </div>
              )}

              {!histLoading && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Scissors className="h-3.5 w-3.5" /> Service history ({completed.length})</p>
                  {completed.length === 0 && <p className="text-sm text-muted-foreground glass-card rounded-xl p-4 text-center">No past services yet.</p>}
                  {completed.map((a) => <AppointmentCard key={a.id} appt={a} showDelete={false} />)}
                  {completed.length > 0 && (
                    <div className="glass-card rounded-xl p-3 flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">Total spent</p>
                      <p className="font-display text-xl text-gradient-gold">₹{totalSpent.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

const AppointmentCard = ({ appt, showDelete, onDelete, deleting }: { appt: HistoryAppointment; showDelete: boolean; onDelete?: () => void; deleting?: boolean }) => {
  const isPackage = appt.notes?.startsWith("Package:");
  const isProduct = appt.notes?.startsWith("Product:");
  const label = appt.services?.name ? appt.services.name
    : isPackage ? appt.notes!.replace(/^Package:\s*/i, "")
    : isProduct ? appt.notes!.replace(/^Product:\s*/i, "")
    : appt.notes ?? "—";
  const typeTag = isPackage ? "package" : isProduct ? "product" : null;

  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
      <div className="text-center w-12 shrink-0">
        <p className="text-xs text-muted-foreground">{format(new Date(appt.scheduled_at), "MMM")}</p>
        <p className="font-display text-2xl text-foreground leading-none">{format(new Date(appt.scheduled_at), "d")}</p>
        <p className="text-[10px] text-muted-foreground">{format(new Date(appt.scheduled_at), "yyyy")}</p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-foreground font-medium truncate">{label}</p>
          {typeTag && <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground shrink-0">{typeTag}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          {appt.services?.duration_min ? `${appt.services.duration_min} min` : ""}
          {appt.staff?.name ? ` · ${appt.staff.name}` : ""}
        </p>
      </div>
      <div className="text-right shrink-0 space-y-1">
        <p className="text-foreground font-medium">₹{appt.total_price}</p>
        <Badge variant="outline" className={`text-xs ${statusColor[appt.status] ?? ""}`}>{appt.status}</Badge>
        {showDelete && onDelete && (
          <button onClick={onDelete} disabled={deleting} className="block ml-auto text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
