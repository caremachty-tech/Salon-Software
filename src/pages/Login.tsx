import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  useEffect(() => { document.title = "Sign in — Salon OS"; }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      // Race against a 10-second timeout
      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Sign in timed out. Please try again.")), 10000)
        ),
      ]) as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;

      const { data, error } = result;
      if (error) { toast.error(error.message); setLoading(false); return; }

      const role = data.user?.user_metadata?.role ?? "owner";
      if (role !== "owner") {
        await supabase.auth.signOut();
        toast.error("Only salon owners can sign in here.");
        setLoading(false);
        return;
      }

      toast.success("Welcome back!");
      nav("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Sign in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to your Salon OS workspace."
      footer={<>New to Salon OS? <Link to="/signup" className="text-primary hover:underline">Register your salon</Link> · <Link to="/staff/login" className="text-muted-foreground hover:text-primary">Staff login</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required placeholder="you@salon.com" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary">Forgot?</a>
          </div>
          <Input id="password" type="password" required placeholder="••••••••" />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default Login;
