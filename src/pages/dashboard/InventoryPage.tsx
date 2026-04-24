import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Plus } from "lucide-react";
import { useData } from "@/context/DataContext";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const getStatus = (stock: number, par: number) => {
  const r = stock / par;
  if (r < 0.2) return "critical";
  if (r < 0.5) return "low";
  return "healthy";
};

const InventoryPage = () => {
  const { inventory, loading, refresh } = useData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ sku: "", name: "", stock: "", par_level: "", unit_cost: "" });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("inventory").insert({
      sku: form.sku,
      name: form.name,
      stock: parseInt(form.stock),
      par_level: parseInt(form.par_level),
      unit_cost: parseFloat(form.unit_cost),
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Inventory item added.");
    setOpen(false);
    setForm({ sku: "", name: "", stock: "", par_level: "", unit_cost: "" });
    refresh();
  };

  if (loading) return <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="flex gap-4 py-3 border-b border-border/30 animate-pulse"><div className="h-4 bg-muted rounded w-1/4"/><div className="h-4 bg-muted rounded w-1/4"/><div className="h-4 bg-muted rounded w-1/4"/><div className="h-4 bg-muted rounded w-1/4"/></div>)}</div>;

  const critical = inventory.filter((i) => getStatus(i.stock, i.par_level) === "critical");
  const low = inventory.filter((i) => getStatus(i.stock, i.par_level) === "low");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-foreground">Inventory</h2>
          <p className="text-sm text-muted-foreground">Live stock counts. Alerts when supplies run low.</p>
        </div>
        <Button variant="hero" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add item</Button>
      </div>

      {(critical.length > 0 || low.length > 0) && (
        <div className="glass-card rounded-xl p-4 border-l-4 border-l-warning bg-warning/5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-foreground font-medium">{critical.length + low.length} items need reordering</p>
            <p className="text-xs text-muted-foreground">{critical.length} critical · {low.length} below par.</p>
          </div>
        </div>
      )}

      <div className="glass-card rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/50">
                <th className="text-left py-3 font-medium">SKU</th>
                <th className="text-left py-3 font-medium">Item</th>
                <th className="text-left py-3 font-medium w-64">Stock</th>
                <th className="text-left py-3 font-medium">Cost</th>
                <th className="text-left py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground text-sm">No inventory items found.</td></tr>
              )}
              {inventory.map((it) => {
                const pct = Math.min(100, (it.stock / it.par_level) * 100);
                const status = getStatus(it.stock, it.par_level);
                return (
                  <tr key={it.id} className="border-b border-border/30">
                    <td className="py-4 font-mono text-xs text-muted-foreground">{it.sku}</td>
                    <td className="py-4 text-foreground">{it.name}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Progress value={pct} className="h-1.5" />
                        <span className="text-xs text-muted-foreground tabular-nums w-16">{it.stock}/{it.par_level}</span>
                      </div>
                    </td>
                    <td className="py-4 text-foreground">₹{it.unit_cost}</td>
                    <td className="py-4">
                      {status === "critical" && <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/10">Critical</Badge>}
                      {status === "low" && <Badge variant="outline" className="border-warning/40 text-warning">Low</Badge>}
                      {status === "healthy" && <Badge variant="outline" className="border-success/30 text-success">Healthy</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display text-2xl">Add inventory item</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>SKU</Label><Input required placeholder="SH-001" value={form.sku} onChange={(e) => set("sku", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Item name</Label><Input required placeholder="Argan Oil 500ml" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label>Stock</Label><Input required type="number" min="0" placeholder="12" value={form.stock} onChange={(e) => set("stock", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Par level</Label><Input required type="number" min="1" placeholder="24" value={form.par_level} onChange={(e) => set("par_level", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Unit cost ₹</Label><Input required type="number" min="0" step="0.01" placeholder="12.00" value={form.unit_cost} onChange={(e) => set("unit_cost", e.target.value)} /></div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={saving}>{saving ? "Saving…" : "Add item"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
