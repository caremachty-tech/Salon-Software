import { Star } from "lucide-react";

const quotes = [
  { name: "Maya Chen", role: "Owner — Maven Studio", body: "We cut no-shows by a third in the first month. The AI matchmaking alone is worth it.", rating: 5 },
  { name: "Devin Park", role: "Master Barber — Oak & Ash", body: "Style memory makes every regular feel like a VIP. Tips are up. Clients stay.", rating: 5 },
  { name: "Lila Romero", role: "Director — Romero Group (12 branches)", body: "Multi-branch reporting that finally makes sense. We replaced four tools with Salon OS.", rating: 5 },
];

export const Testimonials = () => (
  <section className="py-32 bg-surface/30 border-y border-border/40">
    <div className="container">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Loved by owners</p>
        <h2 className="font-display text-5xl text-foreground">Voices from the chair.</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {quotes.map((q) => (
          <figure key={q.name} className="glass-card rounded-2xl p-8 flex flex-col gap-5 hover:border-primary/30 transition">
            <div className="flex gap-0.5">
              {Array.from({ length: q.rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
              ))}
            </div>
            <blockquote className="font-display text-2xl text-foreground leading-snug">"{q.body}"</blockquote>
            <figcaption className="mt-auto pt-4 border-t border-border/50">
              <div className="text-foreground font-medium">{q.name}</div>
              <div className="text-xs text-muted-foreground">{q.role}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);
