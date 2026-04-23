import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Bell, Gift, Plus } from "lucide-react";

const campaigns = [
  { name: "VIP October", channel: "SMS + Email", audience: 182, sent: "3 days ago", status: "Active", rate: "32% open" },
  { name: "Win-back at-risk", channel: "Email", audience: 23, sent: "Today", status: "Active", rate: "—" },
  { name: "Holiday gift cards", channel: "SMS", audience: 1240, sent: "Scheduled", status: "Scheduled", rate: "—" },
];

const MarketingPage = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="font-display text-3xl text-foreground">Marketing</h2>
        <p className="text-sm text-muted-foreground">Reminders, campaigns, and retention nudges.</p>
      </div>
      <Button variant="hero"><Plus className="h-4 w-4" /> New campaign</Button>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      {[
        { icon: Bell, t: "Reminders sent", v: "3,820", s: "this month" },
        { icon: Megaphone, t: "Campaign reach", v: "12,400", s: "across all channels" },
        { icon: Gift, t: "Loyalty rewards", v: "284", s: "redeemed" },
      ].map((s) => (
        <div key={s.t} className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-primary mb-2"><s.icon className="h-4 w-4" /><p className="text-xs uppercase tracking-widest">{s.t}</p></div>
          <p className="font-display text-3xl text-foreground">{s.v}</p>
          <p className="text-xs text-muted-foreground mt-1">{s.s}</p>
        </div>
      ))}
    </div>

    <div className="glass-card rounded-xl p-6">
      <h3 className="font-display text-2xl text-foreground mb-4">Campaigns</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted-foreground">
            <tr className="border-b border-border/50">
              <th className="text-left py-3 font-medium">Name</th>
              <th className="text-left py-3 font-medium">Channel</th>
              <th className="text-left py-3 font-medium">Audience</th>
              <th className="text-left py-3 font-medium">Sent</th>
              <th className="text-left py-3 font-medium">Performance</th>
              <th className="text-left py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.name} className="border-b border-border/30">
                <td className="py-3 text-foreground">{c.name}</td>
                <td className="py-3 text-muted-foreground">{c.channel}</td>
                <td className="py-3 text-muted-foreground">{c.audience.toLocaleString()}</td>
                <td className="py-3 text-muted-foreground">{c.sent}</td>
                <td className="py-3 text-foreground">{c.rate}</td>
                <td className="py-3">
                  <Badge variant="outline" className={c.status === "Active" ? "border-success/40 text-success" : "border-primary/30 text-primary"}>{c.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default MarketingPage;
