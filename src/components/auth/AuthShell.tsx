import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

export const AuthShell = ({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) => (
  <div className="min-h-screen grid lg:grid-cols-2">
    <div className="relative hidden lg:block overflow-hidden noise">
      <div className="absolute inset-0 bg-gradient-noir" />
      <div className="absolute inset-0 bg-gradient-radial-gold opacity-50" />
      <div className="relative h-full flex flex-col justify-between p-12">
        <Logo />
        <div className="space-y-6 max-w-md">
          <h1 className="font-display text-5xl text-foreground leading-tight">
            Where every chair tells a <span className="italic text-gradient-gold">story.</span>
          </h1>
          <p className="text-muted-foreground">Salon OS gives you bookings, billing, staff, and AI growth — in one quietly powerful platform.</p>
        </div>
        <p className="text-xs text-muted-foreground">© Salon OS</p>
      </div>
    </div>
    <div className="flex flex-col">
      <div className="lg:hidden p-6 border-b border-border/40">
        <Logo />
      </div>
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="font-display text-4xl text-foreground">{title}</h2>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>
          {children}
          <p className="text-sm text-center text-muted-foreground">{footer}</p>
          <p className="text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">← back to home</Link>
          </p>
        </div>
      </div>
    </div>
  </div>
);
