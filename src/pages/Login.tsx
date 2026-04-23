import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FormEvent, useEffect } from "react";

const Login = () => {
  const nav = useNavigate();
  useEffect(() => { document.title = "Sign in — Salon OS"; }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    toast.success("Welcome back. Loading your dashboard…");
    setTimeout(() => nav("/dashboard"), 600);
  };

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to your Salon OS workspace."
      footer={<>New to Salon OS? <Link to="/signup" className="text-primary hover:underline">Create an account</Link></>}
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
        <Button type="submit" variant="hero" size="lg" className="w-full">Sign in</Button>
        <Button type="button" variant="outline" size="lg" className="w-full">Continue with Google</Button>
      </form>
    </AuthShell>
  );
};

export default Login;
