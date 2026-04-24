import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

const StaffLogin = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  useEffect(() => { document.title = "Staff Sign in — Salon OS"; }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    // Authenticate directly against the staff table — no Supabase Auth, no emails
    const { data, error } = await supabase
      .from("staff")
      .select("id, name, email, password_hash, salon_id")
      .eq("email", email)
      .single();

    if (error || !data) {
      toast.error("No staff account found with that email.");
      setLoading(false);
      return;
    }

    if (data.password_hash !== password) {
      toast.error("Incorrect password.");
      setLoading(false);
      return;
    }

    // Store staff session in localStorage
    localStorage.setItem("staff_session", JSON.stringify({ id: data.id, name: data.name, email: data.email, salon_id: data.salon_id }));
    toast.success(`Welcome, ${data.name}!`);
    nav("/staff/dashboard");
  };

  return (
    <AuthShell
      title="Staff Portal"
      subtitle="Sign in with your credentials provided by your salon."
      footer={<>Salon owner? <Link to="/login" className="text-primary hover:underline">Owner login</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required placeholder="you@salon.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" type={showPw ? "text" : "password"} required placeholder="••••••••" className="pr-9" />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default StaffLogin;
