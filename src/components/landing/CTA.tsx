import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const CTA = () => (
  <section className="container py-24">
    <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-noir p-12 md:p-20 text-center noise">
      <div className="absolute inset-0 bg-gradient-radial-gold opacity-50" />
      <div className="relative max-w-2xl mx-auto space-y-6">
        <h2 className="font-display text-5xl md:text-6xl text-foreground leading-tight">
          Ready to run your salon <span className="italic text-gradient-gold">like a maestro?</span>
        </h2>
        <p className="text-muted-foreground text-lg">Join thousands of owners using Salon OS to grow revenue, retain clients, and reclaim their evenings.</p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Button asChild variant="hero" size="xl">
            <Link to="/signup">Start free trial <ArrowRight className="ml-1" /></Link>
          </Button>
          <Button asChild variant="glass" size="xl">
            <Link to="/book">Try the booking flow</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);
