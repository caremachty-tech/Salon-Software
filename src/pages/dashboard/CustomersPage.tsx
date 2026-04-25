import { Badge } from "@/components/ui/badge";
import { Heart, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { useAuth } from "@/context/AuthContext";

type Customer = {
  id: string;
  name: string;
  visits: number;
  last_visit_at: string | null;
  lifetime_spend: number;
  tag: "VIP" | "Regular" | "At risk";
};

const tagStyle: Record<string, string> = {
  VIP: "border-primary/40 text-primary bg-primary/10",
  Regular: "border-muted-foreground/30 text-muted-foreground",
  "At risk": "border-destructive/40 text-destructive bg-destructive/10",
};

const CustomersPage = () => {
  const { salon, loading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fetching, setFetching] = useState(false);
  const [vipCount, setVipCount] = useState(0);
  const [atRiskCount, setAtRiskCount] = useState(0);

  useEffect(() => {
    if (!authLoading && salon?.id) {
      setFetching(true);
      supabase
        .from("customers")
        .select("*")
        .eq("salon_id", salon.id)
        .order("lifetime_spend", { ascending: false })
        .then(({ data, error }) => {
          if (error) toast.error(error.message);
          else {
            const rows = (data ?? []) as Customer[];
            setCustomers(rows);
            setVipCount(rows.filter((c) => c.tag === "VIP").length);
            setAtRiskCount(rows.filter((c) => c.tag === "At risk").length);
          }
          setFetching(false);
        });
    }
  }, [salon?.id, authLoading]);

  const isLoading = authLoading || (salon?.id && fetching && customers.length === 0);

  const retention = customers.length
    ? Math.round((customers.filter((c) => c.tag !== "At risk").length / customers.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-3xl text-foreground">Customers</h2>
        <p className="text-sm text-muted-foreground">Visit history, style memory, loyalty intelligence.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-primary mb-2"><Crown className="h-4 w-4" /><p className="text-xs uppercase tracking-widest">VIP segment</p></div>
          <p className="font-display text-3xl text-foreground">{vipCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Top clients by spend</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-success mb-2"><Heart className="h-4 w-4" /><p className="text-xs uppercase tracking-widest">Retention</p></div>
          <p className="font-display text-3xl text-foreground">{retention}%</p>
          <p className="text-xs text-muted-foreground mt-1">Active clients</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-destructive mb-2"><Heart className="h-4 w-4" /><p className="text-xs uppercase tracking-widest">Churn risks</p></div>
          <p className="font-display text-3xl text-foreground">{atRiskCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Flagged clients</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="font-display text-2xl text-foreground mb-4">All customers</h3>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
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
                <tr key={c.id} className="border-b border-border/30 hover:bg-surface/50">
                  <td className="py-3 text-foreground">{c.name}</td>
                  <td className="py-3 text-muted-foreground">{c.visits}</td>
                  <td className="py-3 text-muted-foreground">
                    {c.last_visit_at ? formatDistanceToNow(new Date(c.last_visit_at), { addSuffix: true }) : "—"}
                  </td>
                  <td className="py-3 text-foreground">${c.lifetime_spend.toLocaleString()}</td>
                  <td className="py-3"><Badge variant="outline" className={tagStyle[c.tag]}>{c.tag}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
