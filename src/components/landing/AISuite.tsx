import { Brain, Camera, TrendingUp, Crown } from "lucide-react";

const items = [
  { icon: Brain, title: "Stylist matchmaking", body: "Our model studies past visits, ratings, and style notes to recommend the right stylist for every client — automatically." },
  { icon: Camera, title: "AI hairstyle preview", body: "Clients upload a selfie and preview cuts and colors in seconds. Confidence up, consultations down." },
  { icon: TrendingUp, title: "Demand forecasting", body: "See which Saturday afternoon will go wild — and staff for it three weeks before it happens." },
  { icon: Crown, title: "Loyalty intelligence", body: "Spot VIPs early. Catch churn risks before they cancel. Send the right nudge at the right moment." },
];

export const AISuite = () => (
  <section id="ai" className="relative py-32 overflow-hidden">
    <div className="absolute inset-x-0 top-1/3 h-1/3 bg-gradient-radial-gold opacity-40 blur-3xl" />
    <div className="container relative">
      <div className="max-w-2xl mb-20">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">The intelligence layer</p>
        <h2 className="font-display text-5xl md:text-6xl text-foreground leading-tight">
          AI that understands <span className="italic text-gradient-gold">the craft.</span>
        </h2>
        <p className="mt-6 text-lg text-muted-foreground">
          Salon OS learns the way each chair moves — predicting demand, surfacing VIPs, and helping every stylist do their best work.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {items.map((it) => (
          <div key={it.title} className="group glass-card rounded-2xl p-8 hover:border-primary/40 transition-all hover:-translate-y-1">
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-gold shadow-gold/30 shadow-lg">
                <it.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-foreground mb-2">{it.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{it.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
