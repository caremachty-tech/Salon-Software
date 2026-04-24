import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Lock, Eye, Server, RefreshCw, AlertTriangle } from "lucide-react";

const practices = [
  { icon: Lock, title: "Encryption everywhere", desc: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256. Your data is never stored in plain text." },
  { icon: Server, title: "Secure infrastructure", desc: "Salon OS runs on Supabase, built on AWS infrastructure with SOC 2 Type II compliance, automatic backups, and 99.9% uptime SLA." },
  { icon: Eye, title: "Access controls", desc: "Role-based access ensures staff can only see what they need. Owners have full control over permissions for every team member." },
  { icon: RefreshCw, title: "Regular audits", desc: "We conduct regular security reviews, dependency audits, and penetration testing to identify and fix vulnerabilities proactively." },
  { icon: Shield, title: "Authentication", desc: "Secure authentication powered by Supabase Auth with support for strong passwords. Session tokens are rotated automatically." },
  { icon: AlertTriangle, title: "Incident response", desc: "We have a documented incident response plan. In the event of a breach, affected users will be notified within 72 hours." },
];

const Security = () => (
  <main>
    <Navbar />
    <div className="min-h-screen bg-background pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto space-y-16">

        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Security</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground leading-tight">
            Your data is<br />
            <span className="italic text-gradient-gold">safe with us.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Security is not an afterthought at Salon OS — it's built into every layer of our platform. Here's how we protect your salon's data.
          </p>
        </div>

        {/* Practices */}
        <div className="grid md:grid-cols-2 gap-4">
          {practices.map((p) => (
            <div key={p.title} className="glass-card rounded-xl p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-xl text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Responsible disclosure */}
        <div className="glass-card rounded-2xl p-8 space-y-4 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="font-display text-2xl text-foreground">Responsible disclosure</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-sm">
            If you discover a security vulnerability in Salon OS, we ask that you report it responsibly. Please email us at <a href="mailto:security@salonos.in" className="text-primary hover:underline">security@salonos.in</a> with details of the vulnerability. We will acknowledge your report within 48 hours and work to resolve confirmed issues promptly.
          </p>
          <p className="text-sm text-muted-foreground">
            We do not take legal action against researchers who report vulnerabilities in good faith and follow responsible disclosure practices.
          </p>
        </div>

      </div>
    </div>
    <Footer />
  </main>
);

export default Security;
