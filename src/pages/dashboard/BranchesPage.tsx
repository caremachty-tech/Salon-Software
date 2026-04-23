import { Building2, MapPin, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const branches = [
  { name: "Maven Studio · Downtown", city: "New York, NY", staff: 12, mtd: "$42,180", growth: "+18%" },
  { name: "Maven Studio · West Loop", city: "Chicago, IL", staff: 9, mtd: "$31,420", growth: "+12%" },
  { name: "Maven Studio · Marina", city: "San Francisco, CA", staff: 7, mtd: "$28,900", growth: "+24%" },
  { name: "Maven Studio · Beverly", city: "Los Angeles, CA", staff: 14, mtd: "$56,710", growth: "+9%" },
];

const BranchesPage = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h2 className="font-display text-3xl text-foreground">Branches</h2>
      <p className="text-sm text-muted-foreground">All your locations, unified.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {branches.map((b) => (
        <div key={b.name} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground">{b.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{b.city}</p>
              </div>
            </div>
            <Badge variant="outline" className="border-success/40 text-success"><TrendingUp className="h-3 w-3 mr-1" />{b.growth}</Badge>
          </div>
          <div className="mt-5 pt-5 border-t border-border/40 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Staff</p>
              <p className="font-display text-2xl text-foreground mt-1">{b.staff}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">MTD revenue</p>
              <p className="font-display text-2xl text-gradient-gold mt-1">{b.mtd}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default BranchesPage;
