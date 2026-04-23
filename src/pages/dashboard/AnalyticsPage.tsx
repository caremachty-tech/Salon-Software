import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import { Crown } from "lucide-react";

const monthly = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  v: 18000 + Math.round(Math.sin(i / 1.5) * 6000) + i * 600,
}));
const leaderboard = [
  { name: "Maya Chen", v: 8420, c: 142 },
  { name: "Devin Park", v: 6180, c: 121 },
  { name: "Marco Reyes", v: 5210, c: 98 },
  { name: "Sara Vu", v: 4760, c: 88 },
];
const retention = [{ name: "retention", value: 74, fill: "hsl(var(--primary))" }];

const AnalyticsPage = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h2 className="font-display text-3xl text-foreground">Analytics</h2>
      <p className="text-sm text-muted-foreground">Revenue trends, retention, and team performance.</p>
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 glass-card rounded-xl p-6">
        <h3 className="font-display text-2xl text-foreground mb-1">Revenue · last 12 months</h3>
        <p className="text-xs text-muted-foreground mb-4">Forecast model · 92% accuracy</p>
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
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={retention} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background={{ fill: "hsl(var(--secondary))" }} dataKey="value" cornerRadius={50} />
          </RadialBarChart>
        </ResponsiveContainer>
        <p className="font-display text-5xl text-gradient-gold -mt-32 mb-12">74%</p>
        <p className="text-sm text-muted-foreground mt-12">90-day client retention</p>
      </div>
    </div>

    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-2xl text-foreground">Staff leaderboard · MTD</h3>
        <Crown className="h-4 w-4 text-primary" />
      </div>
      <div className="space-y-3">
        {leaderboard.map((l, i) => {
          const max = leaderboard[0].v;
          const pct = (l.v / max) * 100;
          return (
            <div key={l.name} className="flex items-center gap-4">
              <span className="font-display text-2xl text-muted-foreground w-8">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-foreground">{l.name}</span>
                  <span className="text-sm text-primary font-medium">${l.v.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="text-xs text-muted-foreground w-16 text-right">{l.c} jobs</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default AnalyticsPage;
