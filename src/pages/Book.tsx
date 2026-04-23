import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronRight, Star, Clock, Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import b1 from "@/assets/barber-1.jpg";
import b2 from "@/assets/barber-2.jpg";
import b3 from "@/assets/barber-3.jpg";

const services = [
  { id: "cut", name: "Premium Cut", duration: "45 min", price: 70, desc: "Consultation + cut + style" },
  { id: "color", name: "Color Refresh", duration: "90 min", price: 180, desc: "Single-process color & gloss" },
  { id: "balayage", name: "Balayage", duration: "180 min", price: 240, desc: "Hand-painted highlights" },
  { id: "beard", name: "Beard Sculpt", duration: "30 min", price: 45, desc: "Hot towel + precision shape" },
  { id: "keratin", name: "Keratin Treatment", duration: "150 min", price: 320, desc: "Smooth, shine, tame frizz" },
  { id: "kids", name: "Kids' Cut", duration: "30 min", price: 35, desc: "Ages 12 and under" },
];

const stylists = [
  { id: "maya", name: "Maya Chen", role: "Master Colorist", img: b2, rating: 4.9, reviews: 312, specialty: "Balayage · Color correction" },
  { id: "devin", name: "Devin Park", role: "Senior Barber", img: b3, rating: 4.8, reviews: 248, specialty: "Fades · Beard work" },
  { id: "marco", name: "Marco Reyes", role: "Stylist", img: b1, rating: 4.7, reviews: 184, specialty: "Modern cuts · Texture" },
];

const slots = ["09:00", "09:45", "10:30", "11:15", "12:00", "13:30", "14:15", "15:00", "15:45", "16:30", "17:15", "18:00"];

const Steps = ({ step }: { step: number }) => (
  <div className="flex items-center justify-center gap-2 md:gap-4 mb-12">
    {["Service", "Stylist", "Time", "Confirm"].map((label, i) => (
      <div key={label} className="flex items-center gap-2 md:gap-4">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs uppercase tracking-widest transition-all",
          step === i ? "bg-primary text-primary-foreground" : step > i ? "text-primary" : "text-muted-foreground",
        )}>
          {step > i ? <Check className="h-3 w-3" /> : <span className="font-semibold">{i + 1}</span>}
          <span className="hidden sm:inline">{label}</span>
        </div>
        {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
      </div>
    ))}
  </div>
);

const Book = () => {
  useEffect(() => { document.title = "Book your visit — Salon OS"; }, []);
  const [step, setStep] = useState(0);
  const [service, setService] = useState<typeof services[number] | null>(null);
  const [stylist, setStylist] = useState<typeof stylists[number] | null>(null);
  const [slot, setSlot] = useState<string | null>(null);

  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <section className="relative pt-32 pb-12 noise overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-radial-gold opacity-50" />
        <div className="container relative">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <Badge variant="outline" className="border-primary/30 text-primary"><Sparkles className="h-3 w-3 mr-1" /> AI-recommended slots</Badge>
            <h1 className="font-display text-5xl md:text-6xl text-foreground leading-tight">Book your <span className="italic text-gradient-gold">next visit.</span></h1>
            <p className="text-muted-foreground">Real-time availability. Confirmed instantly.</p>
          </div>

          <Steps step={step} />

          <div className="max-w-4xl mx-auto">
            {step === 0 && (
              <div className="grid md:grid-cols-2 gap-3 animate-fade-in">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setService(s); setStep(1); }}
                    className={cn(
                      "text-left glass-card rounded-xl p-5 hover:border-primary transition-all hover:-translate-y-0.5",
                      service?.id === s.id && "border-primary",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-2xl text-foreground">{s.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                      </div>
                      <span className="font-display text-3xl text-gradient-gold">${s.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration}</p>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="grid md:grid-cols-3 gap-4 animate-fade-in">
                {stylists.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => { setStylist(s); setStep(2); }}
                    className={cn(
                      "group text-left glass-card rounded-xl overflow-hidden hover:border-primary transition-all hover:-translate-y-1",
                      stylist?.id === s.id && "border-primary",
                    )}
                  >
                    {i === 0 && <div className="absolute z-10 m-3 px-2 py-1 text-[10px] uppercase tracking-widest rounded-full bg-primary text-primary-foreground font-semibold">AI pick</div>}
                    <div className="aspect-[4/5] overflow-hidden bg-surface">
                      <img src={s.img} alt={s.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-2xl text-foreground">{s.name}</h3>
                        <Badge variant="outline" className="border-primary/30 text-primary"><Star className="h-3 w-3 mr-1 fill-primary" />{s.rating}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.role}</p>
                      <p className="text-xs text-foreground/80 italic">{s.specialty}</p>
                      <p className="text-[11px] text-muted-foreground">{s.reviews} reviews</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="glass-card rounded-xl p-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Available · Friday, October 24</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {slots.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSlot(s)}
                        className={cn(
                          "rounded-lg border py-3 text-sm transition-all",
                          slot === s
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50 text-foreground hover:bg-primary/5",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="hero" size="lg" disabled={!slot} onClick={() => setStep(3)}>Continue</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="glass-card rounded-2xl p-8 md:p-10 animate-scale-in">
                <h3 className="font-display text-3xl text-foreground mb-6">Confirm your booking</h3>
                <dl className="divide-y divide-border/50 text-sm">
                  {[
                    ["Service", `${service?.name} · ${service?.duration}`],
                    ["Stylist", stylist?.name],
                    ["Date & Time", `Fri, October 24 · ${slot}`],
                    ["Location", "Maven Studio · Downtown"],
                    ["Total", `$${service?.price}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-3">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-foreground font-medium text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full mt-8"
                  onClick={() => {
                    toast.success("Booking confirmed! Confirmation sent to your phone.");
                    setTimeout(() => { setStep(0); setService(null); setStylist(null); setSlot(null); }, 1200);
                  }}
                >
                  Confirm booking
                </Button>
              </div>
            )}

            {step > 0 && (
              <div className="mt-6 flex justify-center">
                <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="h-3 w-3" /> Back
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Book;
