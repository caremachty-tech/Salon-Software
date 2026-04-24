import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const STORAGE_KEY = "demo_popup_dismissed";

export const DemoPopup = () => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", salon_name: "", phone: "", email: "" });

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setOpen(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim()) { toast.error("Phone number is required."); return; }
    setSaving(true);
    await supabase.from("demo_requests").insert({
      name: form.name.trim(),
      salon_name: form.salon_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
    });
    setSaving(false);
    setDone(true);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) dismiss(); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden [&>button]:hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 pb-4 relative">
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 grid place-items-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs uppercase tracking-widest text-primary font-medium">Free Demo</span>
          </div>
          <h2 className="font-display text-2xl text-foreground">See Salon OS in action</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Get a personalised demo — we'll show you exactly how it works for your salon.
          </p>
        </div>

        <div className="p-6 pt-4">
          {done ? (
            <div className="text-center space-y-3 py-4">
              <div className="h-14 w-14 rounded-full bg-success/10 border border-success/30 grid place-items-center mx-auto">
                <Sparkles className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-display text-xl text-foreground">You're on the list!</h3>
              <p className="text-sm text-muted-foreground">We'll reach out to {form.phone} within 24 hours to schedule your demo.</p>
              <Button variant="hero" className="w-full mt-2" onClick={dismiss}>Got it</Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Your name <span className="text-destructive">*</span></Label>
                  <Input required placeholder="Priya Sharma" value={form.name} onChange={(e) => set("name", e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Salon name <span className="text-destructive">*</span></Label>
                  <Input required placeholder="Glam Studio" value={form.salon_name} onChange={(e) => set("salon_name", e.target.value)} className="h-9 text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone number <span className="text-destructive">*</span></Label>
                <Input required type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email <span className="text-muted-foreground">(optional)</span></Label>
                <Input type="email" placeholder="you@salon.com" value={form.email} onChange={(e) => set("email", e.target.value)} className="h-9 text-sm" />
              </div>
              <Button type="submit" variant="hero" className="w-full mt-1" disabled={saving}>
                {saving ? "Sending request…" : "Request free demo →"}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">No commitment. We'll call you within 24 hours.</p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
