import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Package, Users, Layers } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type CustomerPackageRow = {
  id: string;
  sessions_used: number;
  sessions_total: number;
  created_at: string;
  customers: { name: string } | null;
  packages: { name: string; service_names: string } | null;
};

const POINTS_PER_100 = 10;

const PackagesPage = () => {
  const { packages, loading, refresh } = useData();
  const { salon } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", sessions_total: "5", service_names: "", loyalty_points: "0" });
  const [redemptions, setRedemptions] = useState<CustomerPackageRow[]>([]);
  const [redLoading, setRedLoading] = useState(true);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    supabase
      .from("customer_packages")
      .select("id, sessions_used, sessions_total, created_at, customers(name), packages(name, service_names)")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setRedemptions((data ?? []) as unknown as CustomerPackageRow[]);
        setRedLoading(false);
      });
  }, [packages]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("packages").insert({
      name: form.name,
      price: parseFloat(form.price),
      sessions_total: parseInt(form.sessions_total),
      service_names: form.service_names,
      loyalty_points: parseInt(form.loyalty_points) || 0,
      salon_id: salon?.id ?? null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Package created.");
    setOpen(false);
    setForm({ name: "", price: "", sessions_total: "5", service_names: "", loyalty_points: "0" });
    refresh();
  };

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-foreground">Packages & Loyalty</h2>
          <p className="text-sm text-muted-foreground">Bundle deals and points — {POINTS_PER_100} pts per ₹100 spent.</p>
        </div>
        <Button variant="hero" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New package</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-primary mb-2"><Layers className="h-4 w-4" /><p className="text-xs uppercase tracking-widest">Packages</p></div>
          <p className="font-display text-3xl text-foreground">{packages.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active bundles</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-success mb-2"><Users className="h-4 w-4" /><p className="text-xs uppercase tracking-widest">Sold</p></div>
          <p className="font-display text-3xl text-foreground">{redemptions.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Customer packages</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-primary mb-2"><Package className="h-4 w-4" /><p className="text-xs uppercase tracking-widest">Points rate</p></div>
          <p className="font-display text-3xl text-foreground">{POINTS_PER_100}</p>
          <p className="text-xs text-muted-foreground mt-1">Points per ₹100</p>
        </div>
      </div>

      {/* Package catalog */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-display text-xl text-foreground">Package catalog</h3>
        {packages.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No packages yet. Create your first bundle.</p>
        )}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="glass-card rounded-xl p-4 space-y-2 border border-border/60">
              <div className="flex items-start justify-between">
                <p className="text-foreground font-medium">{pkg.name}</p>
                <p className="font-display text-lg text-gradient-gold">₹{pkg.price}</p>
              </div>
              <p className="text-xs text-muted-foreground">{pkg.service_names}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/30 text-primary text-xs">{pkg.sessions_total} sessions</Badge>
                {(pkg.loyalty_points ?? 0) > 0 && <Badge variant="outline" className="border-success/30 text-success text-xs">+{pkg.loyalty_points} pts</Badge>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer redemptions */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-display text-xl text-foreground">Customer packages</h3>
        {redLoading && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}</div>}
        {!redLoading && redemptions.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No packages sold yet.</p>
        )}
        {!redLoading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 font-medium">Customer</th>
                  <th className="text-left py-3 font-medium">Package</th>
                  <th className="text-left py-3 font-medium">Services</th>
                  <th className="text-left py-3 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.map((r) => {
                  const pct = Math.round((r.sessions_used / r.sessions_total) * 100);
                  return (
                    <tr key={r.id} className="border-b border-border/30 hover:bg-surface/50">
                      <td className="py-3 text-foreground font-medium">{r.customers?.name ?? "—"}</td>
                      <td className="py-3 text-foreground">{r.packages?.name ?? "—"}</td>
                      <td className="py-3 text-muted-foreground text-xs">{r.packages?.service_names ?? "—"}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden w-24">
                            <div className="h-full bg-gradient-gold rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">{r.sessions_used}/{r.sessions_total}</span>
                          {r.sessions_used >= r.sessions_total && (
                            <Badge variant="outline" className="text-[10px] border-destructive/40 text-destructive">Used up</Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display text-2xl">New package</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Package name</Label>
              <Input required placeholder="Haircut + Color + Wash" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Services included</Label>
              <Input required placeholder="Haircut, Color, Wash" value={form.service_names} onChange={(e) => set("service_names", e.target.value)} />
              <p className="text-[11px] text-muted-foreground">Comma-separated list of services in this bundle.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Bundle price ₹</Label>
                <Input required type="number" min="0" step="0.01" placeholder="999" value={form.price} onChange={(e) => set("price", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Total sessions</Label>
                <Input required type="number" min="1" placeholder="5" value={form.sessions_total} onChange={(e) => set("sessions_total", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">Loyalty points awarded</Label>
              <Input type="number" min="0" placeholder="0" value={form.loyalty_points} onChange={(e) => set("loyalty_points", e.target.value)} />
              <p className="text-[11px] text-muted-foreground">Points customer earns when this package is purchased. 10 pts = ₹1.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={saving}>{saving ? "Saving…" : "Create package"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackagesPage;
