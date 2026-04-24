import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/constants";

const tiers = [
  {
    name: "Starter",
    desc: "For solo stylists & boutique salons.",
    features: ["1 location", "Up to 3 staff", "Online bookings", "POS & invoicing", "Email reminders", "Customer history"],
  },
  {
    name: "Studio",
    desc: "For growing salons with a full team.",
    features: ["1 location", "Up to 15 staff", "AI stylist matching", "Loyalty & CRM", "Inventory + alerts", "SMS reminders", "Analytics dashboard"],
    highlight: true,
  },
  {
    name: "Empire",
    desc: "For multi-branch chains & franchises.",
    features: ["Unlimited locations", "Unlimited staff", "Demand forecasting", "Hairstyle AI Studio", "Custom roles", "Dedicated support", "Priority onboarding"],
  },
];

export const Pricing = () => (
  <section id="pricing" className="py-32">
    <div className="container">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Plans</p>
        <h2 className="font-display text-5xl md:text-6xl text-foreground leading-tight">
          Everything your salon needs,<br />
          <span className="italic text-gradient-gold">in one platform.</span>
        </h2>
        <p className="mt-5 text-muted-foreground">
          Message us on WhatsApp to get started — we'll set you up with a 7-day free trial.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={cn(
              "relative rounded-2xl p-8 transition-all flex flex-col",
              t.highlight
                ? "bg-gradient-gold-soft border border-primary/40 shadow-gold/20 shadow-2xl scale-[1.02] z-10"
                : "glass-card hover:border-primary/30",
            )}
          >
            {t.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full">
                Most popular
              </span>
            )}
            <h3 className="font-display text-3xl text-foreground">{t.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>

            <ul className="mt-8 space-y-3 flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-foreground/90">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              asChild
              variant={t.highlight ? "hero" : "outline"}
              className="w-full mt-8"
              size="lg"
            >
              <a href={waLink(t.name)} target="_blank" rel="noopener noreferrer">
                WhatsApp us to request access
              </a>
            </Button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-10">
        Message us on WhatsApp and we'll get back to you within 24 hours.
      </p>
    </div>
  </section>
);
