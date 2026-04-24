import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const sections = [
  {
    title: "Information we collect",
    body: `We collect information you provide directly — such as your name, email address, phone number, and salon details when you register or use our services. We also collect usage data, including pages visited, features used, and actions taken within the platform, to improve our product.`,
  },
  {
    title: "How we use your information",
    body: `We use your information to provide and improve Salon OS, send transactional communications (such as booking confirmations and invoices), respond to support requests, and send product updates where you have opted in. We do not sell your personal data to third parties.`,
  },
  {
    title: "Data storage and security",
    body: `Your data is stored securely on Supabase infrastructure hosted in data centres with industry-standard encryption at rest and in transit. We implement access controls, audit logging, and regular security reviews to protect your information.`,
  },
  {
    title: "Customer data",
    body: `Salon owners are responsible for the customer data they enter into Salon OS. We process this data on your behalf as a data processor. Customer data is used solely to provide the service and is never used for advertising or shared with third parties without your consent.`,
  },
  {
    title: "Cookies",
    body: `We use essential cookies to maintain your session and preferences. We do not use third-party advertising cookies. You can control cookie settings through your browser.`,
  },
  {
    title: "Your rights",
    body: `You have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at privacy@salonos.in. We will respond within 30 days.`,
  },
  {
    title: "Changes to this policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice. Continued use of Salon OS after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "Contact",
    body: `For privacy-related questions, contact our Data Protection Officer at privacy@salonos.in or write to: Salon OS, Bangalore, Karnataka, India.`,
  },
];

const Privacy = () => (
  <main>
    <Navbar />
    <div className="min-h-screen bg-background pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto space-y-10">

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Legal</p>
          <h1 className="font-display text-5xl text-foreground">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
          <p className="text-muted-foreground leading-relaxed">
            At Salon OS, we take your privacy seriously. This policy explains what data we collect, how we use it, and your rights as a user.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="glass-card rounded-xl p-6 space-y-3">
              <h2 className="font-display text-xl text-foreground">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
    <Footer />
  </main>
);

export default Privacy;
