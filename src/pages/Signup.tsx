import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FormEvent, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const roles = [
  { id: "owner", label: "Salon Owner", desc: "Run the whole operation." },
  { id: "staff", label: "Staff / Stylist", desc: "Manage your chair." },
  { id: "customer", label: "Customer", desc: "Book your next cut." },
];

const Signup = () => {
  const nav = useNavigate();
  const [role, setRole] = useState("owner");
  useEffect(() => { document.title = "Create account — Salon OS"; }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.success("Account created. Welcome to Salon OS.");
    setTimeout(() => nav(role === "customer" ? "/book" : "/dashboard"), 600);
  };

  return (
    <AuthShell
      title="Start your free trial."
      subtitle="14 days. No card required."
      footer={<>Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>I am a…</Label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => setRole(r.id)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-all",
                  role === r.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface/50 hover:border-primary/40",
                )}
              >
                <div className="text-sm font-medium text-foreground">{r.label}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required placeholder="Ava Rivers" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" required placeholder="you@salon.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required placeholder="At least 8 characters" />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full">Create account</Button>
      </form>
    </AuthShell>
  );
};

export default Signup;
