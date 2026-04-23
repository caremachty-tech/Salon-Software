import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, Users, Calendar, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { Badge } from "@/components/ui/badge";

const revenue = [
  { d: "Mon", v: 1200 }, { d: "Tue", v: 1850 }, { d: "Wed", v: 1620 },
  { d: "Thu", v: 2100 }, { d: "Fri", v: 2980 }, { d: "Sat", v: 3640 }, { d: "Sun", v: 2200 },
];
const peak = [
  { h: "9a", b: 4 }, { h: "10a", b: 7 }, { h: "11a", b: 9 }, { h: "12p", b: 12 },
  { h: "1p", b: 8 }, { h: "2p", b: 11 }, { h: "3p", b: 14 }, { h: "4p", b: 16 },
  { h: "5p", b: 18 }, { h: "6p", b: 13 }, { h: "7p", b: 7 },
];
const upcoming = [
  { time: "10:30", client: "Olivia Park", service: "Balayage + Cut", stylist: "Maya", price: "$240" },
  { time: "11:15", client: "James Reid", service: "Beard Sculpt", stylist: "Devin", price: "$45" },
  { time: "12:00", client: "Sara Lin", service: "Color Refresh", stylist: "Maya", price: "$180" },
  { time: "1:30", client: "Theo Vance", service: "Premium Cut", stylist: "Marco", price: "$70" },
  { time: "2:45", client: "Ava Wells", service: "Keratin Treatment", stylist: "Maya", price: "$320" },
];

const Overview = () => (
  <div className="space-y-8 animate-fade-in">
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <StatCard label="Today's Revenue" value="$4,820" delta="12% vs yesterday" icon={<DollarSign className="h-4 w-4" />} />
      <StatCard label="Appointments" value="38" delta="6 new" icon={<Calendar className="h-4 w-4" />} />
      <StatCard label="New Clients" value="9" delta="3 from referrals" icon={<Users className="h-4 w-4" />} />
      <StatCard label="Avg Ticket" value="$127" delta="8% MoM" icon={<TrendingUp className="h-4 w-4" />} />
    </div>

    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-2xl text-foreground">Revenue this week</h3>
            <p className="text-xs text-muted-foreground">Updated 2 min ago</p>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">+18% WoW</Badge>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenue}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="d" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="font-display text-2xl text-foreground mb-1">Peak hours</h3>
        <p className="text-xs text-muted-foreground mb-4">Predicted bookings today</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={peak}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="h" stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Bar dataKey="b" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-2xl text-foreground">Today's appointments</h3>
          <p className="text-xs text-muted-foreground">Live schedule across all chairs</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border/50">
              <th className="text-left py-3 font-medium">Time</th>
              <th className="text-left py-3 font-medium">Client</th>
              <th className="text-left py-3 font-medium">Service</th>
              <th className="text-left py-3 font-medium">Stylist</th>
              <th className="text-right py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((u, i) => (
              <tr key={i} className="border-b border-border/30 hover:bg-surface/50 transition-colors">
                <td className="py-3 font-mono text-primary">{u.time}</td>
                <td className="py-3 text-foreground">{u.client}</td>
                <td className="py-3 text-muted-foreground">{u.service}</td>
                <td className="py-3 text-muted-foreground">{u.stylist}</td>
                <td className="py-3 text-right text-foreground font-medium">{u.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Overview;
