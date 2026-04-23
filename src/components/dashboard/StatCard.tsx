import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const StatCard = ({
  label,
  value,
  delta,
  icon,
  trend = "up",
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
  trend?: "up" | "down";
}) => (
  <div className="glass-card rounded-xl p-5 hover:border-primary/30 transition-colors">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="font-display text-3xl text-foreground mt-2">{value}</p>
        {delta && (
          <p className={cn("text-xs mt-2", trend === "up" ? "text-success" : "text-destructive")}>
            {trend === "up" ? "▲" : "▼"} {delta}
          </p>
        )}
      </div>
      {icon && <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center text-primary">{icon}</div>}
    </div>
  </div>
);
