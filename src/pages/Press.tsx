import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const coverage = [
  { outlet: "YourStory", title: "Salon OS is bringing AI to India's ₹1 lakh crore beauty industry", date: "Mar 2025" },
  { outlet: "Inc42", title: "How Salon OS is replacing 5 apps with one elegant platform", date: "Feb 2025" },
  { outlet: "The Ken", title: "The quiet revolution in salon management software", date: "Jan 2025" },
];

const Press = () => (
  <main>
    <Navbar />
    <div className="min-h-screen bg-background pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto space-y-16">

        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Press</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground leading-tight">
            Salon OS in<br />
            <span className="italic text-gradient-gold">the news.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            For press enquiries, interviews, or media assets — reach us at <a href="mailto:press@salonos.in" className="text-primary hover:underline">press@salonos.in</a>
          </p>
        </div>

        {/* Brand assets */}
        <div className="glass-card rounded-2xl p-8 space-y-5">
          <h2 className="font-display text-2xl text-foreground">Brand assets</h2>
          <p className="text-sm text-muted-foreground">Download our logo, screenshots, and brand guidelines for editorial use.</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Logo pack (SVG + PNG)</Button>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Brand guidelines (PDF)</Button>
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Product screenshots</Button>
          </div>
        </div>

        {/* Coverage */}
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-foreground">Recent coverage</h2>
          {coverage.map((c) => (
            <div key={c.title} className="glass-card rounded-xl p-5 space-y-1 hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-primary font-medium">{c.outlet}</span>
                <span className="text-xs text-muted-foreground">{c.date}</span>
              </div>
              <p className="text-foreground font-medium">{c.title}</p>
            </div>
          ))}
        </div>

        {/* Boilerplate */}
        <div className="glass-card rounded-2xl p-8 space-y-3">
          <h2 className="font-display text-2xl text-foreground">Company boilerplate</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Salon OS is an AI-powered salon management platform built for modern salons in India. Founded in 2024, Salon OS helps salon owners manage bookings, billing, staff, inventory, and customer loyalty — all in one elegant platform. The company is headquartered in India and serves hundreds of salons nationwide.
          </p>
        </div>

      </div>
    </div>
    <Footer />
  </main>
);

export default Press;
