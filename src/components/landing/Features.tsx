import { Calendar, Users, Package, BarChart3, CreditCard, Sparkles, Heart, Building2, Brain } from "lucide-react";

const features = [
  { icon: Calendar, title: "Smart Bookings", desc: "Real-time availability, online booking, automated reminders. No-shows drop by up to 38%." },
  { icon: Brain, title: "AI Recommendations", desc: "Match customers to the perfect stylist using preference history and AI scoring." },
  { icon: Sparkles, title: "Hairstyle Studio", desc: "Upload a photo, preview AI-suggested styles before the chair turns." },
  { icon: CreditCard, title: "POS & Billing", desc: "Quick checkout, split payments, instant invoices and tip routing." },
  { icon: Users, title: "Staff & Commission", desc: "Schedules, earnings, tips, and performance leaderboards in one view." },
  { icon: Package, title: "Inventory Control", desc: "Live stock counts and low-inventory alerts so you never run out mid-color." },
  { icon: Heart, title: "CRM & Loyalty", desc: "Visit history, style memory, VIP tiers, and churn-prediction nudges." },
  { icon: BarChart3, title: "Revenue Analytics", desc: "Peak-hour insights, retention trends, and forecasted demand." },
  { icon: Building2, title: "Multi-Branch", desc: "Run one salon or fifty — unified data, isolated tenancy, role-based access." },
];

export const Features = () => (
  <section id="features" className="relative py-32">
    <div className="container">
      <div className="max-w-2xl mb-16">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Everything you need</p>
        <h2 className="font-display text-5xl md:text-6xl text-foreground leading-tight">
          One platform.<br />
          <span className="italic text-gradient-gold">Every part of the salon.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/40 rounded-2xl overflow-hidden">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="group relative bg-background hover:bg-surface-elevated transition-colors p-8 lg:p-10"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-gold-soft opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative space-y-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
