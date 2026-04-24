import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Plus } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const StaffPage = () => {
  const { staff, loading, refresh } = useData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", rating: "5.0", commission_pct: "35" });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("staff").insert({
      name: form.name,
      role: form.role,
      rating: parseFloat(form.rating),
      commission_pct: parseInt(form.commission_pct),
      jobs_count: 0,
      mtd_earnings: 0,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Staff member added.");
    setOpen(false);
    setForm({ name: "", role: "", rating: "5.0", commission_pct: "35" });
    refresh();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

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
        {staff.map((s) => (
          <div key={s.id} className="glass-card rounded-xl overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-1 group">
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
                <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">MTD</p><p className="font-display text-xl text-gradient-gold">${s.mtd_earnings.toLocaleString()}</p></div>
                <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Comm</p><p className="font-display text-xl text-foreground">{s.commission_pct}%</p></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display text-2xl">Add staff member</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label>Full name</Label><Input required placeholder="Maya Chen" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Role</Label><Input required placeholder="Master Colorist" value={form.role} onChange={(e) => set("role", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Rating (0–5)</Label><Input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => set("rating", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Commission %</Label><Input type="number" min="0" max="100" value={form.commission_pct} onChange={(e) => set("commission_pct", e.target.value)} /></div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={saving}>{saving ? "Saving…" : "Add staff"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffPage;
