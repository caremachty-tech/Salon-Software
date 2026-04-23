import { Badge } from "@/components/ui/badge";
import { Heart, Crown } from "lucide-react";

const customers = [
  { name: "Olivia Park", visits: 28, last: "3 days ago", spend: "$3,420", tag: "VIP" },
  { name: "James Reid", visits: 14, last: "1 week ago", spend: "$840", tag: "Regular" },
  { name: "Sara Lin", visits: 22, last: "2 days ago", spend: "$2,180", tag: "VIP" },
  { name: "Theo Vance", visits: 6, last: "3 weeks ago", spend: "$420", tag: "At risk" },
  { name: "Ava Wells", visits: 19, last: "5 days ago", spend: "$2,940", tag: "VIP" },
  { name: "Marco Cole", visits: 4, last: "2 months ago", spend: "$210", tag: "At risk" },
];

const tagStyle: Record<string, string> = {
  VIP: "border-primary/40 text-primary bg-primary/10",
  Regular: "border-muted-foreground/30 text-muted-foreground",
  "At risk": "border-destructive/40 text-destructive bg-destructive/10",
};

const CustomersPage = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h2 className="font-display text-3xl text-foreground">Customers</h2>
      <p className="text-sm text-muted-foreground">Visit history, style memory, loyalty intelligence.</p>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 text-primary mb-2"><Crown className="h-4 w-4" /><p className="text-xs uppercase tracking-widest">VIP segment</p></div>
        <p className="font-display text-3xl text-foreground">182</p>
        <p className="text-xs text-muted-foreground mt-1">Top 12% by spend</p>
      </div>
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 text-success mb-2"><Heart className="h-4 w-4" /><p className="text-xs uppercase tracking-widest">Retention 90d</p></div>
        <p className="font-display text-3xl text-foreground">74%</p>
        <p className="text-xs text-muted-foreground mt-1">+6pts vs last quarter</p>
      </div>
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 text-destructive mb-2"><Heart className="h-4 w-4" /><p className="text-xs uppercase tracking-widest">Churn risks</p></div>
        <p className="font-display text-3xl text-foreground">23</p>
        <p className="text-xs text-muted-foreground mt-1">AI-flagged this week</p>
      </div>
    </div>

    <div className="glass-card rounded-xl p-6">
      <h3 className="font-display text-2xl text-foreground mb-4">Recent activity</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border/50">
              <th className="text-left py-3 font-medium">Customer</th>
              <th className="text-left py-3 font-medium">Visits</th>
              <th className="text-left py-3 font-medium">Last visit</th>
              <th className="text-left py-3 font-medium">Lifetime spend</th>
              <th className="text-left py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.name} className="border-b border-border/30 hover:bg-surface/50">
                <td className="py-3 text-foreground">{c.name}</td>
                <td className="py-3 text-muted-foreground">{c.visits}</td>
                <td className="py-3 text-muted-foreground">{c.last}</td>
                <td className="py-3 text-foreground">{c.spend}</td>
                <td className="py-3"><Badge variant="outline" className={tagStyle[c.tag]}>{c.tag}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default CustomersPage;
