import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import { Crown } from "lucide-react";
import { useData } from "@/context/DataContext";
import { format } from "date-fns";

const AnalyticsPage = () => {
  const { revenue, staff, customers, loading } = useData();
  if (loading) return <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}</div>;

  const monthly = revenue.map((r) => ({ m: format(new Date(r.date), "MMM d"), v: r.amount }));
  const leaderboard = [...staff].sort((a, b) => b.mtd_earnings - a.mtd_earnings).slice(0, 4);
  const retention = customers.length
    ? Math.round((customers.filter((c) => c.tag !== "At risk").length / customers.length) * 100)
    : 0;
  const retentionData = [{ name: "retention", value: retention, fill: "hsl(var(--primary))" }];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-3xl text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground">Revenue trends, retention, and team performance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <h3 className="font-display text-2xl text-foreground mb-1">Revenue · last 30 days</h3>
          <p className="text-xs text-muted-foreground mb-4">Live from database</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-6 flex flex-col items-center text-center">
          <h3 className="font-display text-2xl text-foreground mb-2">Retention</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={retentionData} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: "hsl(var(--secondary))" }} dataKey="value" cornerRadius={50} />
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="font-display text-5xl text-gradient-gold -mt-32 mb-12">{retention}%</p>
          <p className="text-sm text-muted-foreground mt-12">Active client retention</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl text-foreground">Staff leaderboard · MTD</h3>
          <Crown className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-3">
          {leaderboard.map((l, i) => {
            const max = leaderboard[0]?.mtd_earnings ?? 1;
            const pct = (l.mtd_earnings / max) * 100;
            return (
              <div key={l.id} className="flex items-center gap-4">
                <span className="font-display text-2xl text-muted-foreground w-8">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-foreground">{l.name}</span>
                    <span className="text-sm text-primary font-medium">₹{l.mtd_earnings.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">{l.jobs_count} jobs</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
