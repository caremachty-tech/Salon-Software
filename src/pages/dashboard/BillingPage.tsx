import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Item = { id: number; name: string; price: number; qty: number };
const catalog = [
  { name: "Premium Cut", price: 70 },
  { name: "Beard Sculpt", price: 45 },
  { name: "Balayage", price: 240 },
  { name: "Color Refresh", price: 180 },
  { name: "Keratin Treatment", price: 320 },
  { name: "Argan Oil 200ml", price: 28 },
  { name: "Conditioner 500ml", price: 24 },
];

const BillingPage = () => {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "Balayage", price: 240, qty: 1 },
    { id: 2, name: "Argan Oil 200ml", price: 28, qty: 1 },
  ]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h2 className="font-display text-3xl text-foreground">Quick billing</h2>
          <p className="text-sm text-muted-foreground">Add services & products. Take payment in seconds.</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <Input placeholder="Search service or product…" className="bg-surface mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {catalog.map((c) => (
              <button
                key={c.name}
                onClick={() => setItems((prev) => [...prev, { id: Date.now(), name: c.name, price: c.price, qty: 1 }])}
                className="text-left rounded-lg border border-border bg-surface hover:border-primary/40 hover:bg-primary/5 p-3 transition-all"
              >
                <div className="text-sm text-foreground">{c.name}</div>
                <div className="text-xs text-primary mt-1">${c.price}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="glass-card rounded-xl p-6 space-y-4 h-fit">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl text-foreground">Order</h3>
          <Receipt className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {items.length === 0 && <p className="text-sm text-muted-foreground">Add items from the catalog.</p>}
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-2 text-sm">
              <div className="flex-1">
                <div className="text-foreground">{i.name}</div>
                <div className="text-xs text-muted-foreground">${i.price} × {i.qty}</div>
              </div>
              <button onClick={() => setItems((p) => p.filter((x) => x.id !== i.id))} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="border-t border-border/50 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
          <div className="flex justify-between text-foreground text-lg pt-2 font-display"><span>Total</span><span className="text-gradient-gold">${total.toFixed(2)}</span></div>
        </div>
        <Button variant="hero" className="w-full" size="lg" onClick={() => toast.success("Payment received. Invoice sent.")}>
          <Plus className="h-4 w-4" /> Charge ${total.toFixed(2)}
        </Button>
      </aside>
    </div>
  );
};

export default BillingPage;
