import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useData } from "@/context/DataContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Star, Search, TrendingUp, Clock, Repeat } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type RawAppt = {
  id: string;
  scheduled_at: string;
  total_price: number;
  staff_id: string | null;
  service_id: string | null;
  staff: { id: string; name: string; rating: number } | null;
  services: { id: string; name: string } | null;
};

type StaffScore = {
  staffId: string;
  staffName: string;
  rating: number;
  score: number;
  sessionsTogether: number;
  lastSeen: string | null;
  topService: string | null;
  reasons: string[];
};

type CustomerRec = {
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  visits: number;
  lastVisit: string | null;
  topStaff: StaffScore | null;
  preferredService: string | null;
  avgSpend: number;
  totalAppts: number;
};

// Pure history-based scoring — no external API
const scoreStaff = (appts: RawAppt[], allStaff: { id: string; name: string; rating: number }[]): StaffScore[] => {
  const staffMap: Record<string, { count: number; lastDate: string | null; services: Record<string, number>; rating: number; name: string }> = {};

  for (const a of appts) {
    if (!a.staff_id || !a.staff) continue;
    if (!staffMap[a.staff_id]) {
      staffMap[a.staff_id] = { count: 0, lastDate: null, services: {}, rating: a.staff.rating ?? 5, name: a.staff.name };
    }
    staffMap[a.staff_id].count += 1;
    if (!staffMap[a.staff_id].lastDate || a.scheduled_at > staffMap[a.staff_id].lastDate!) {
      staffMap[a.staff_id].lastDate = a.scheduled_at;
    }
    if (a.services?.name) {
      staffMap[a.staff_id].services[a.services.name] = (staffMap[a.staff_id].services[a.services.name] ?? 0) + 1;
    }
  }

  const maxCount = Math.max(...Object.values(staffMap).map((s) => s.count), 1);

  return Object.entries(staffMap).map(([id, s]) => {
    const frequencyScore = (s.count / maxCount) * 40;          // 40% weight — how often they've worked together
    const ratingScore = ((s.rating ?? 5) / 5) * 30;            // 30% weight — staff rating
    const recencyScore = s.lastDate                             // 20% weight — how recently
      ? Math.max(0, 20 - (Date.now() - new Date(s.lastDate).getTime()) / (1000 * 60 * 60 * 24 * 30) * 5)
      : 0;
    const loyaltyBonus = s.count >= 3 ? 10 : s.count >= 2 ? 5 : 0; // 10% — loyalty bonus

    const score = Math.round(frequencyScore + ratingScore + recencyScore + loyaltyBonus);
    const topService = Object.entries(s.services).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const reasons: string[] = [];
    if (s.count >= 3) reasons.push(`${s.count} sessions together`);
    else if (s.count >= 1) reasons.push(`${s.count} past session${s.count > 1 ? "s" : ""}`);
    if (s.rating >= 4.5) reasons.push(`${s.rating.toFixed(1)}★ rating`);
    if (topService) reasons.push(`Specialises in ${topService}`);
    if (s.lastDate) {
      const daysAgo = Math.floor((Date.now() - new Date(s.lastDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo < 30) reasons.push("Recently served this customer");
    }

    return { staffId: id, staffName: s.name, rating: s.rating, score, sessionsTogether: s.count, lastSeen: s.lastDate, topService, reasons };
  }).sort((a, b) => b.score - a.score);
};

const AIRecommendationsPage = () => {
  const { customers, staff, loading } = useData();
  const [recs, setRecs] = useState<CustomerRec[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (loading || customers.length === 0) return;
    const build = async () => {
      setRecLoading(true);

      const { data: appts } = await supabase
        .from("appointments")
        .select("id, scheduled_at, total_price, staff_id, service_id, staff(id, name, rating), services(id, name)")
        .eq("status", "completed")
        .order("scheduled_at", { ascending: false })
        .limit(1000);

      const allAppts = (appts ?? []) as unknown as (RawAppt & { customer_id: string })[];

      // Group by customer
      const byCustomer: Record<string, (RawAppt & { customer_id: string })[]> = {};
      for (const a of allAppts) {
        if (!a.customer_id) continue;
        if (!byCustomer[a.customer_id]) byCustomer[a.customer_id] = [];
        byCustomer[a.customer_id].push(a);
      }

      const result: CustomerRec[] = customers
        .filter((c) => byCustomer[c.id]?.length > 0)
        .map((c) => {
          const cAppts = byCustomer[c.id] ?? [];
          const staffScores = scoreStaff(cAppts, staff);
          const topStaff = staffScores[0] ?? null;

          // Most used service
          const svcCount: Record<string, number> = {};
          for (const a of cAppts) {
            if (a.services?.name) svcCount[a.services.name] = (svcCount[a.services.name] ?? 0) + 1;
          }
          const preferredService = Object.entries(svcCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
          const avgSpend = cAppts.length ? Math.round(cAppts.reduce((s, a) => s + (a.total_price ?? 0), 0) / cAppts.length) : 0;

          return {
            customerId: c.id,
            customerName: c.name,
            customerPhone: c.phone,
            visits: c.visits,
            lastVisit: c.last_visit_at,
            topStaff,
            preferredService,
            avgSpend,
            totalAppts: cAppts.length,
          };
        })
        .filter((r) => r.topStaff !== null)
        .sort((a, b) => (b.topStaff?.score ?? 0) - (a.topStaff?.score ?? 0));

      setRecs(result);
      setRecLoading(false);
    };
    build();
  }, [loading, customers.length]);

  const filtered = recs.filter((r) =>
    !search ||
    r.customerName.toLowerCase().includes(search.toLowerCase()) ||
    (r.customerPhone ?? "").includes(search)
  );

  if (loading || recLoading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1,2,3,4,5,6].map(i => <div key={i} className="glass-card rounded-xl p-5 h-40 animate-pulse bg-muted" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-3xl text-foreground">AI Recommendations</h2>
            <Badge variant="outline" className="border-primary/30 text-primary gap-1">
              <Sparkles className="h-3 w-3" /> AI
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Stylist matches based on each customer's visit history, service preferences, and session frequency.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="glass-card rounded-xl p-4 border-primary/20 bg-primary/5">
        <p className="text-xs uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> How the AI scores work</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><Repeat className="h-3.5 w-3.5 text-primary shrink-0" /> Session frequency (40%)</div>
          <div className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-primary shrink-0" /> Stylist rating (30%)</div>
          <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary shrink-0" /> Recency (20%)</div>
          <div className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" /> Loyalty bonus (10%)</div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by customer name or phone…" className="pl-9 bg-surface" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center text-muted-foreground">
          <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No recommendations yet. Complete some billing transactions first to build history.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <div key={r.customerId} className="glass-card rounded-xl p-5 space-y-4 hover:border-primary/30 transition-all">
            {/* Customer */}
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-gradient-gold grid place-items-center text-primary-foreground font-semibold font-display shrink-0">
                {r.customerName[0]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium truncate">{r.customerName}</p>
                <p className="text-xs text-muted-foreground">{r.customerPhone ?? "—"} · {r.visits} visits</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">Avg spend</p>
                <p className="text-sm font-display text-gradient-gold">₹{r.avgSpend}</p>
              </div>
            </div>

            {/* Preferred service */}
            {r.preferredService && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-foreground/60">Prefers:</span>
                <Badge variant="outline" className="border-border text-foreground text-xs">{r.preferredService}</Badge>
              </div>
            )}

            {/* AI Recommendation */}
            {r.topStaff && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] uppercase tracking-widest text-primary font-medium">AI Recommended Stylist</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-gradient-gold grid place-items-center text-primary-foreground text-xs font-semibold shrink-0">
                      {r.topStaff.staffName[0]}
                    </span>
                    <div>
                      <p className="text-foreground font-medium text-sm">{r.topStaff.staffName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />{r.topStaff.rating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-display text-primary">{r.topStaff.score}</div>
                    <div className="text-[10px] text-muted-foreground">match score</div>
                  </div>
                </div>
                {/* Score bar */}
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-gold rounded-full transition-all" style={{ width: `${r.topStaff.score}%` }} />
                </div>
                {/* Reasons */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {r.topStaff.reasons.map((reason) => (
                    <span key={reason} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{reason}</span>
                  ))}
                </div>
              </div>
            )}

            {r.lastVisit && (
              <p className="text-[11px] text-muted-foreground">
                Last visit {formatDistanceToNow(new Date(r.lastVisit), { addSuffix: true })}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendationsPage;
