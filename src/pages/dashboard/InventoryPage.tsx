import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  stock: number;
  par_level: number;
  unit_cost: number;
};

const InventoryPage = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("inventory").select("*").order("name")
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setItems(data ?? []);
        setLoading(false);
      });
  }, []);

  const critical = items.filter((i) => i.stock / i.par_level < 0.2);
  const low = items.filter((i) => i.stock / i.par_level >= 0.2 && i.stock / i.par_level < 0.5);

  const getStatus = (item: InventoryItem) => {
    const ratio = item.stock / item.par_level;
    if (ratio < 0.2) return "critical";
    if (ratio < 0.5) return "low";
    return "healthy";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-3xl text-foreground">Inventory</h2>
        <p className="text-sm text-muted-foreground">Live stock counts. Alerts when supplies run low.</p>
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

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

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
              {!loading && items.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground text-sm">No inventory items found.</td></tr>
              )}
              {items.map((it) => {
                const pct = Math.min(100, (it.stock / it.par_level) * 100);
                const status = getStatus(it);
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
                    <td className="py-4 text-foreground">${it.unit_cost}</td>
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
    </div>
  );
};

export default InventoryPage;
