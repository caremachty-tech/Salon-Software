import { Building2, MapPin, Users, TrendingUp, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useData } from "@/context/DataContext";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const BranchesPage = () => {
  const { branches, loading, refresh } = useData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", growth_pct: "+0%" });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("branches").insert({
      name: form.name,
      city: form.city,
      growth_pct: form.growth_pct,
      staff_count: 0,
      mtd_revenue: 0,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Branch added.");
    setOpen(false);
    setForm({ name: "", city: "", growth_pct: "+0%" });
    refresh();
  };

  if (loading) return <div className="grid gap-4 md:grid-cols-2">{[1,2,3,4].map(i=><div key={i} className="glass-card rounded-xl p-6 animate-pulse space-y-3"><div className="h-5 bg-muted rounded w-2/3"/><div className="h-3 bg-muted rounded w-1/3"/></div>)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-foreground">Branches</h2>
          <p className="text-sm text-muted-foreground">All your locations, unified.</p>
        </div>
        <Button variant="hero" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add branch</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {branches.length === 0 && <p className="text-sm text-muted-foreground">No branches found.</p>}
        {branches.map((b) => (
          <div key={b.id} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-foreground">{b.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{b.city}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-success/40 text-success">
                <TrendingUp className="h-3 w-3 mr-1" />{b.growth_pct}
              </Badge>
            </div>
            <div className="mt-5 pt-5 border-t border-border/40 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Staff</p>
                <p className="font-display text-2xl text-foreground mt-1">{b.staff_count}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">MTD revenue</p>
                <p className="font-display text-2xl text-gradient-gold mt-1">₹{b.mtd_revenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display text-2xl">Add branch</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label>Branch name</Label><Input required placeholder="Maven Studio · Midtown" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>City</Label><Input required placeholder="New York, NY" value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Growth %</Label><Input placeholder="+0%" value={form.growth_pct} onChange={(e) => set("growth_pct", e.target.value)} /></div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={saving}>{saving ? "Saving…" : "Add branch"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchesPage;
