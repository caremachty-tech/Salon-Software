import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Bell, Gift, Plus } from "lucide-react";
import { useData } from "@/context/DataContext";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const MarketingPage = () => {
  const { campaigns, loading, refresh } = useData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", channel: "Email", audience_count: "", status: "Scheduled" });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("campaigns").insert({
      name: form.name,
      channel: form.channel,
      audience_count: parseInt(form.audience_count) || 0,
      status: form.status,
      open_rate: "—",
      sent_at: form.status === "Active" ? new Date().toISOString() : null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Campaign created.");
    setOpen(false);
    setForm({ name: "", channel: "Email", audience_count: "", status: "Scheduled" });
    refresh();
  };

  if (loading) return <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="flex gap-4 py-3 border-b border-border/30 animate-pulse"><div className="h-4 bg-muted rounded w-1/4"/><div className="h-4 bg-muted rounded w-1/4"/><div className="h-4 bg-muted rounded w-1/4"/><div className="h-4 bg-muted rounded w-1/4"/></div>)}</div>;

  const totalReach = campaigns.reduce((s, c) => s + c.audience_count, 0);
  const active = campaigns.filter((c) => c.status === "Active").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-foreground">Marketing</h2>
          <p className="text-sm text-muted-foreground">Reminders, campaigns, and retention nudges.</p>
        </div>
        <Button variant="hero" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New campaign</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Bell, t: "Active campaigns", v: String(active), s: "running now" },
          { icon: Megaphone, t: "Campaign reach", v: totalReach.toLocaleString(), s: "across all channels" },
          { icon: Gift, t: "Total campaigns", v: String(campaigns.length), s: "all time" },
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
              {campaigns.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-muted-foreground text-sm">No campaigns found.</td></tr>
              )}
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-border/30">
                  <td className="py-3 text-foreground">{c.name}</td>
                  <td className="py-3 text-muted-foreground">{c.channel}</td>
                  <td className="py-3 text-muted-foreground">{c.audience_count.toLocaleString()}</td>
                  <td className="py-3 text-muted-foreground">
                    {c.sent_at ? formatDistanceToNow(new Date(c.sent_at), { addSuffix: true }) : "Scheduled"}
                  </td>
                  <td className="py-3 text-foreground">{c.open_rate}</td>
                  <td className="py-3">
                    <Badge variant="outline" className={c.status === "Active" ? "border-success/40 text-success" : "border-primary/30 text-primary"}>
                      {c.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display text-2xl">New campaign</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5"><Label>Campaign name</Label><Input required placeholder="VIP November" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Channel</Label>
                <Select value={form.channel} onValueChange={(v) => set("channel", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="SMS + Email">SMS + Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Audience size</Label><Input type="number" min="0" placeholder="500" value={form.audience_count} onChange={(e) => set("audience_count", e.target.value)} /></div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={saving}>{saving ? "Saving…" : "Create campaign"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingPage;
