import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";

const items = [
  { sku: "SH-001", name: "Argan Oil Shampoo 500ml", stock: 4, par: 24, cost: "$12", status: "low" },
  { sku: "CO-211", name: "Hydrate Conditioner 500ml", stock: 18, par: 24, cost: "$11" },
  { sku: "CL-008", name: "Premium Bleach Powder 1kg", stock: 2, par: 12, cost: "$48", status: "critical" },
  { sku: "DV-017", name: "10 Vol Developer 1L", stock: 22, par: 30, cost: "$8" },
  { sku: "TN-120", name: "Toner — Pearl Ash", stock: 9, par: 16, cost: "$24" },
  { sku: "TL-003", name: "Disposable Capes 50ct", stock: 1, par: 6, cost: "$22", status: "critical" },
];

const InventoryPage = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h2 className="font-display text-3xl text-foreground">Inventory</h2>
      <p className="text-sm text-muted-foreground">Live stock counts. Alerts when supplies run low.</p>
    </div>

    <div className="glass-card rounded-xl p-4 border-l-4 border-l-warning bg-warning/5 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
      <div>
        <p className="text-foreground font-medium">3 items need reordering</p>
        <p className="text-xs text-muted-foreground">2 critical · 1 below par. Auto-order suggestions ready.</p>
      </div>
    </div>

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
            {items.map((it) => {
              const pct = Math.min(100, (it.stock / it.par) * 100);
              return (
                <tr key={it.sku} className="border-b border-border/30">
                  <td className="py-4 font-mono text-xs text-muted-foreground">{it.sku}</td>
                  <td className="py-4 text-foreground">{it.name}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <Progress value={pct} className="h-1.5" />
                      <span className="text-xs text-muted-foreground tabular-nums w-16">{it.stock}/{it.par}</span>
                    </div>
                  </td>
                  <td className="py-4 text-foreground">{it.cost}</td>
                  <td className="py-4">
                    {it.status === "critical" && <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/10">Critical</Badge>}
                    {it.status === "low" && <Badge variant="outline" className="border-warning/40 text-warning">Low</Badge>}
                    {!it.status && <Badge variant="outline" className="border-success/30 text-success">Healthy</Badge>}
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

export default InventoryPage;
