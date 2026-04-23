import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const hours = Array.from({ length: 10 }, (_, i) => 9 + i);
const stylists = ["Maya", "Devin", "Marco", "Sara"];
const slots = [
  { stylist: 0, h: 0, span: 1, client: "O. Park", service: "Balayage" },
  { stylist: 1, h: 1, span: 2, client: "J. Reid", service: "Beard Sculpt" },
  { stylist: 2, h: 2, span: 1, client: "S. Lin", service: "Color" },
  { stylist: 0, h: 3, span: 2, client: "T. Vance", service: "Cut" },
  { stylist: 3, h: 4, span: 3, client: "A. Wells", service: "Keratin" },
  { stylist: 1, h: 5, span: 1, client: "M. Cole", service: "Trim" },
  { stylist: 2, h: 6, span: 2, client: "R. Diaz", service: "Highlights" },
];

const CalendarPage = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="font-display text-3xl text-foreground">Calendar</h2>
        <p className="text-sm text-muted-foreground">Today · Friday, October 24</p>
      </div>
      <Button variant="hero"><Plus className="h-4 w-4" /> New booking</Button>
    </div>

    <div className="glass-card rounded-xl p-4 overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-[120px_repeat(10,_1fr)] gap-px bg-border/40 rounded-lg overflow-hidden">
          <div className="bg-surface p-3 text-xs text-muted-foreground uppercase tracking-widest">Stylist</div>
          {hours.map((h) => (
            <div key={h} className="bg-surface p-3 text-center text-xs text-muted-foreground font-mono">{h}:00</div>
          ))}
          {stylists.map((s, sIdx) => (
            <div key={s} className="contents">
              <div className="bg-background p-3 text-foreground font-medium text-sm flex items-center gap-2">
                <span className="h-7 w-7 rounded-full bg-gradient-gold text-primary-foreground grid place-items-center text-xs font-semibold">{s[0]}</span>
                {s}
              </div>
              {hours.map((_, hIdx) => {
                const slot = slots.find((sl) => sl.stylist === sIdx && sl.h === hIdx);
                return (
                  <div key={hIdx} className="bg-background min-h-[64px] relative p-1">
                    {slot && (
                      <div
                        className="absolute inset-1 bg-gradient-gold-soft border border-primary/40 rounded-md p-2 text-xs hover:border-primary cursor-pointer transition"
                        style={{ width: `calc(${slot.span * 100}% - 8px)` }}
                      >
                        <div className="text-primary font-medium">{slot.client}</div>
                        <div className="text-muted-foreground">{slot.service}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="flex flex-wrap gap-3 text-xs">
      <Badge variant="outline" className="border-primary/30">7 confirmed</Badge>
      <Badge variant="outline" className="border-warning/30 text-warning">2 pending</Badge>
      <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">3 walk-in slots open</Badge>
    </div>
  </div>
);

export default CalendarPage;
