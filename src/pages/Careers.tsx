import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight } from "lucide-react";

const openings = [
  { title: "Full-Stack Engineer", team: "Engineering", location: "Remote · India", type: "Full-time" },
  { title: "Product Designer", team: "Design", location: "Bangalore / Remote", type: "Full-time" },
  { title: "Customer Success Manager", team: "Growth", location: "Chennai / Remote", type: "Full-time" },
  { title: "Sales Development Rep", team: "Sales", location: "Remote · India", type: "Full-time" },
];

const perks = [
  "Fully remote-friendly", "Competitive salary + equity", "Health insurance",
  "Learning & development budget", "Flexible hours", "Work on real problems",
];

const Careers = () => (
  <main>
    <Navbar />
    <div className="min-h-screen bg-background pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto space-y-16">

        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Careers</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground leading-tight">
            Help us build the future<br />
            <span className="italic text-gradient-gold">of salon software.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            We're a small, focused team building tools that real salon owners use every day. If you care about craft, speed, and making a tangible difference — we'd love to meet you.
          </p>
        </div>

        {/* Perks */}
        <div className="glass-card rounded-2xl p-8 space-y-4">
          <h2 className="font-display text-2xl text-foreground">Why Salon OS</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {perks.map((p) => (
              <div key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Openings */}
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-foreground">Open roles</h2>
          {openings.map((job) => (
            <div key={job.title} className="glass-card rounded-xl p-5 flex items-center justify-between gap-4 hover:border-primary/30 transition-all group">
              <div className="space-y-1">
                <p className="text-foreground font-medium">{job.title}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{job.team}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                  <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">{job.type}</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 gap-1 group-hover:border-primary/40">
                Apply <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-8 text-center space-y-3">
          <h3 className="font-display text-2xl text-foreground">Don't see your role?</h3>
          <p className="text-muted-foreground text-sm">We're always open to exceptional people. Send us your story.</p>
          <Button variant="hero" asChild>
            <a href="mailto:careers@salonos.in">Get in touch →</a>
          </Button>
        </div>

      </div>
    </div>
    <Footer />
  </main>
);

export default Careers;
