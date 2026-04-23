import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Starter",
    price: "$29",
    desc: "For solo stylists & boutique salons.",
    features: ["1 location", "Up to 3 staff", "Online bookings", "POS & invoicing", "Email reminders"],
  },
  {
    name: "Studio",
    price: "$79",
    desc: "Most popular for growing salons.",
    features: ["1 location", "Up to 15 staff", "AI stylist matching", "Loyalty & CRM", "Inventory + alerts", "SMS reminders"],
    highlight: true,
  },
  {
    name: "Empire",
    price: "$199",
    desc: "Multi-branch chains & franchises.",
    features: ["Unlimited locations", "Unlimited staff", "Demand forecasting", "Hairstyle AI Studio", "Custom roles & SSO", "Dedicated success"],
  },
];

export const Pricing = () => (
  <section id="pricing" className="py-32">
    <div className="container">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Pricing</p>
        <h2 className="font-display text-5xl md:text-6xl text-foreground leading-tight">
          Pricing as elegant as <span className="italic text-gradient-gold">your work.</span>
        </h2>
        <p className="mt-5 text-muted-foreground">14-day free trial. No card. Cancel any time.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={cn(
              "relative rounded-2xl p-8 transition-all",
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
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-6xl text-gradient-gold">{t.price}</span>
              <span className="text-muted-foreground text-sm">/mo</span>
            </div>
            <ul className="mt-8 space-y-3">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-foreground/90">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild variant={t.highlight ? "hero" : "outline"} className="w-full mt-8" size="lg">
              <Link to="/signup">Start free trial</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  </section>
);
