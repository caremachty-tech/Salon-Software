import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-salon.jpg";
import { waLink } from "@/lib/constants";

export const Hero = () => (
  <section className="relative min-h-[100svh] flex items-center overflow-hidden noise">
    <div className="absolute inset-0">
      <img src={heroImg} alt="Luxury salon interior" className="w-full h-full object-cover opacity-50" />
      <div className="absolute inset-0 bg-gradient-hero-overlay" />
      <div className="absolute inset-0 bg-gradient-radial-gold opacity-60" />
    </div>

    <div className="container relative z-10 pt-24 pb-16">
      <div className="max-w-3xl space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium tracking-wide text-foreground/90">AI-powered salon intelligence</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-foreground animate-fade-in" style={{ animationDelay: "120ms" }}>
          The operating system for <span className="italic text-gradient-gold">modern salons.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: "240ms" }}>
          Bookings, billing, inventory, staff, and AI-driven growth — one elegant platform crafted for salons that care about the craft.
        </p>

        <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: "360ms" }}>
          <Button asChild variant="hero" size="xl">
            <a href={waLink()} target="_blank" rel="noopener noreferrer">
              Request access <ArrowRight className="ml-1" />
            </a>
          </Button>
          <Button asChild variant="glass" size="xl">
            <Link to="/book">See booking demo</Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link to="/hairstyle-studio"><Sparkles className="h-4 w-4 mr-1" /> Try Hairstyle Studio</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-8 animate-fade-in-slow" style={{ animationDelay: "600ms" }}>
          {[
            { v: "12k+", l: "Salons trust us" },
            { v: "4.9★", l: "Owner rating" },
            { v: "—38%", l: "No-show drop" },
          ].map((s) => (
            <div key={s.l} className="flex items-baseline gap-2">
              <span className="font-display text-3xl text-gradient-gold">{s.v}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">{s.l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60 animate-glow-pulse">
      scroll to explore
    </div>
  </section>
);
