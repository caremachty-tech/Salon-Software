import { Link } from "react-router-dom";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

export const Logo = ({ className, showText = true }: { className?: string; showText?: boolean }) => (
  <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)}>
    <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold shadow-gold/40 shadow-lg transition-transform group-hover:scale-105">
      <Scissors className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
    </span>
    {showText && (
      <span className="font-display text-2xl leading-none">
        <span className="text-foreground">Salon</span>
        <span className="text-gradient-gold ml-1">OS</span>
      </span>
    )}
  </Link>
);
