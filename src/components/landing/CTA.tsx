import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { waLink } from "@/lib/constants";

export const CTA = () => (
  <section className="container py-24">
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-noir p-12 md:p-20 text-center noise">
      <div className="absolute inset-0 bg-gradient-radial-gold opacity-50" />
      <div className="relative max-w-2xl mx-auto space-y-6">
        <h2 className="font-display text-5xl md:text-6xl text-foreground leading-tight">
          Ready to run your salon <span className="italic text-gradient-gold">like a maestro?</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Access is by invitation only. Message us on WhatsApp and we'll get you set up with a 7-day free trial.
        </p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Button asChild variant="hero" size="xl">
            <a href={waLink()} target="_blank" rel="noopener noreferrer">
              WhatsApp us to request access
            </a>
          </Button>
          <Button asChild variant="glass" size="xl">
            <Link to="/book">Try the booking flow</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          We'll review your request and reach out within 24 hours.
        </p>
      </div>
    </div>
  </section>
);
