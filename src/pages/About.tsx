import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Scissors, Heart, Zap, Users } from "lucide-react";

const values = [
  { icon: Heart, title: "Built for stylists", desc: "Every feature is designed around how salons actually work — not how software companies think they work." },
  { icon: Zap, title: "Speed first", desc: "Billing in seconds. Bookings in one tap. We obsess over removing friction from every workflow." },
  { icon: Users, title: "Owner & team", desc: "Powerful enough for the owner, simple enough for every staff member on their first day." },
  { icon: Scissors, title: "Craft matters", desc: "We believe great software should feel as refined as the services your salon delivers." },
];

const About = () => (
  <main>
    <Navbar />
    <div className="min-h-screen bg-background pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto space-y-20">

        {/* Hero */}
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">About us</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground leading-tight">
            We're building the operating system<br />
            <span className="italic text-gradient-gold">for modern salons.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Salon OS was born from a simple frustration — salon owners were juggling five different apps, paper appointment books, and WhatsApp groups just to run their business. We decided to fix that.
          </p>
        </div>

        {/* Story */}
        <div className="glass-card rounded-2xl p-8 md:p-12 space-y-5">
          <h2 className="font-display text-3xl text-foreground">Our story</h2>
          <p className="text-muted-foreground leading-relaxed">
            Founded in 2024, Salon OS started as a side project by a team of engineers who kept watching their local salon owners struggle with outdated tools. What began as a simple booking system quickly grew into a full platform — billing, inventory, staff management, loyalty, and AI-powered recommendations.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Today, Salon OS powers salons across India, helping owners spend less time on admin and more time on what they love — the craft.
          </p>
        </div>

        {/* Values */}
        <div className="space-y-6">
          <h2 className="font-display text-3xl text-foreground">What we believe</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {values.map((v) => (
              <div key={v.title} className="glass-card rounded-xl p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-xl text-foreground">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 text-center">
          {[{ v: "2024", l: "Founded" }, { v: "500+", l: "Salons onboarded" }, { v: "India", l: "Headquartered" }].map((s) => (
            <div key={s.l} className="glass-card rounded-xl p-6">
              <p className="font-display text-4xl text-gradient-gold">{s.v}</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2">{s.l}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
    <Footer />
  </main>
);

export default About;
