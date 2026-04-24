import { Logo } from "./Logo";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t border-border/50 bg-surface/50 mt-32">
    <div className="container py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
      <div className="col-span-2 space-y-4">
        <Logo />
        <p className="text-sm text-muted-foreground max-w-xs">
          The AI-powered operating system for modern salons. Built for owners, loved by stylists.
        </p>
      </div>
      <div>
        <h4 className="font-sans text-xs uppercase tracking-widest text-primary mb-4">Product</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="#features" className="hover:text-primary">Features</a></li>
          <li><a href="#pricing" className="hover:text-primary">Pricing</a></li>
          <li><Link to="/book" className="hover:text-primary">Book a cut</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-sans text-xs uppercase tracking-widest text-primary mb-4">Company</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/about" className="hover:text-primary">About</Link></li>
          <li><Link to="/careers" className="hover:text-primary">Careers</Link></li>
          <li><Link to="/press" className="hover:text-primary">Press</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-sans text-xs uppercase tracking-widest text-primary mb-4">Legal</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/privacy" className="hover:text-primary">Privacy</Link></li>
          <li><Link to="/terms" className="hover:text-primary">Terms</Link></li>
          <li><Link to="/security" className="hover:text-primary">Security</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border/30">
      <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Salon OS. Crafted with care.</p>
        <p className="text-xs text-muted-foreground">Made for salons that move at the speed of style.</p>
      </div>
    </div>
  </footer>
);
