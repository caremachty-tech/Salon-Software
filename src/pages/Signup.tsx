import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { waLink } from "@/lib/constants";

const Signup = () => {
  useEffect(() => { document.title = "Request Access — Salon OS"; }, []);

  return (
    <AuthShell
      title="Request access."
      subtitle="Salon OS is available by invitation only."
      footer={<>Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></>}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          {[
            "Send us a WhatsApp message with your salon name and contact number",
            "We'll review your request and reach out within 24 hours",
            "Once approved, you'll receive your login credentials",
            "Enjoy a 7-day free trial — no payment needed upfront",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="h-5 w-5 rounded-full bg-primary/10 border border-primary/30 grid place-items-center text-[10px] font-bold text-primary shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>

        <Button asChild variant="hero" size="lg" className="w-full">
          <a href={waLink()} target="_blank" rel="noopener noreferrer">
            WhatsApp us to get access
          </a>
        </Button>

        <div className="glass-card rounded-xl p-4 space-y-2">
          <p className="text-xs uppercase tracking-widest text-primary flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> What's included in the trial
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Full access to all features for 7 days</li>
            <li>• Personal onboarding call with our team</li>
            <li>• No credit card required</li>
            <li>• Pricing quoted after the trial based on your needs</li>
          </ul>
        </div>
      </div>
    </AuthShell>
  );
};

export default Signup;
