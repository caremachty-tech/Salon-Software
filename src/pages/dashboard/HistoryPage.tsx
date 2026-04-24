import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, History } from "lucide-react";
import { format } from "date-fns";

type HistoryRecord = {
  id: string;
  scheduled_at: string;
  total_price: number;
  notes: string | null;
  customers: { name: string; phone: string | null } | null;
  services: { name: string } | null;
  staff: { name: string } | null;
};

const HistoryPage = () => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    supabase
      .from("appointments")
      .select("id, scheduled_at, total_price, notes, customers(name, phone), services(name), staff(name)")
      .eq("status", "completed")
      .order("scheduled_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (!error) setRecords((data ?? []) as unknown as HistoryRecord[]);
        setLoading(false);
      });
  }, []);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const date = r.scheduled_at.split("T")[0];
    if (from && date < from) return false;
    if (to && date > to) return false;
    if (!q) return true;
    return (
      r.customers?.name?.toLowerCase().includes(q) ||
      r.customers?.phone?.includes(q) ||
      r.services?.name?.toLowerCase().includes(q) ||
      r.staff?.name?.toLowerCase().includes(q) ||
      r.notes?.toLowerCase().includes(q)
    );
  });

  const totalRevenue = filtered.reduce((s, r) => s + (r.total_price ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-foreground">History</h2>
          <p className="text-sm text-muted-foreground">All completed transactions — services and products.</p>
        </div>
        <div className="glass-card rounded-xl px-5 py-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total revenue</p>
          <p className="font-display text-2xl text-gradient-gold">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by customer, phone, service, stylist…" className="pl-9 bg-surface" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Input type="date" className="bg-surface w-36" value={from} onChange={(e) => setFrom(e.target.value)} />
            <span className="text-muted-foreground text-sm">to</span>
            <Input type="date" className="bg-surface w-36" value={to} onChange={(e) => setTo(e.target.value)} />
            {(from || to) && (
              <button onClick={() => { setFrom(""); setTo(""); }} className="text-xs text-muted-foreground hover:text-destructive">✕</button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/50">
                <th className="text-left py-3 font-medium">Date & Time</th>
                <th className="text-left py-3 font-medium">Customer</th>
                <th className="text-left py-3 font-medium">Phone</th>
                <th className="text-left py-3 font-medium">Service / Product</th>
                <th className="text-left py-3 font-medium">Stylist</th>
                <th className="text-right py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading && [1,2,3,4,5].map(i => (
                <tr key={i} className="border-b border-border/30">
                  {[1,2,3,4,5,6].map(j => (
                    <td key={j} className="py-3"><div className="h-4 bg-muted rounded animate-pulse w-3/4" /></td>
                  ))}
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    {search ? "No records match your search." : "No completed transactions yet."}
                  </td>
                </tr>
              )}

              {!loading && filtered.map((r) => {
                const label = r.services?.name
                  ? r.services.name
                  : r.notes
                    ? r.notes.replace(/^Product:\s*/i, "")
                    : "—";
                const isProduct = !r.services?.name && !!r.notes;

                return (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-surface/50 transition-colors">
                    <td className="py-3 font-mono text-xs text-primary">
                      {format(new Date(r.scheduled_at), "MMM d, yyyy · HH:mm")}
                    </td>
                    <td className="py-3 text-foreground font-medium">
                      {r.customers?.name ?? <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {r.customers?.phone ?? "—"}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{label}</span>
                        {isProduct && (
                          <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground">product</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {r.staff?.name ?? "—"}
                    </td>
                    <td className="py-3 text-right font-display text-foreground">
                      ₹{(r.total_price ?? 0).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-right pt-1">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
