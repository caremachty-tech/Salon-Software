import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Plus } from "lucide-react";
import b1 from "@/assets/barber-1.jpg";
import b2 from "@/assets/barber-2.jpg";
import b3 from "@/assets/barber-3.jpg";

const staff = [
  { name: "Maya Chen", role: "Master Colorist", img: b2, rating: 4.9, jobs: 142, earnings: "$8,420", commission: 45 },
  { name: "Devin Park", role: "Senior Barber", img: b3, rating: 4.8, jobs: 121, earnings: "$6,180", commission: 40 },
  { name: "Marco Reyes", role: "Stylist", img: b1, rating: 4.7, jobs: 98, earnings: "$5,210", commission: 35 },
];

const StaffPage = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="font-display text-3xl text-foreground">Staff</h2>
        <p className="text-sm text-muted-foreground">Manage your team, earnings, and commissions.</p>
      </div>
      <Button variant="hero"><Plus className="h-4 w-4" /> Add staff</Button>
    </div>

    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {staff.map((s) => (
        <div key={s.name} className="glass-card rounded-xl overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-1 group">
          <div className="aspect-[4/3] overflow-hidden bg-surface">
            <img src={s.img} alt={s.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-2xl text-foreground">{s.name}</h3>
                <p className="text-xs text-muted-foreground">{s.role}</p>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                <Star className="h-3 w-3 mr-1 fill-primary" /> {s.rating}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Jobs</p>
                <p className="font-display text-xl text-foreground">{s.jobs}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">MTD</p>
                <p className="font-display text-xl text-gradient-gold">{s.earnings}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Comm</p>
                <p className="font-display text-xl text-foreground">{s.commission}%</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default StaffPage;
