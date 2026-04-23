import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "AI Suite", href: "#ai" },
  { label: "Book a Cut", href: "/book" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50" : "bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) =>
            l.href.startsWith("#") ? (
              <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {l.label}
              </a>
            ) : (
              <Link key={l.href} to={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {l.label}
              </Link>
            ),
          )}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/signup">Start free trial</Link>
          </Button>
        </div>
        <button className="md:hidden text-foreground" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 animate-fade-in">
          <div className="container py-6 flex flex-col gap-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-foreground/80 hover:text-primary py-1">
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
              <Button asChild variant="outline">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild variant="hero">
                <Link to="/signup">Start free trial</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
