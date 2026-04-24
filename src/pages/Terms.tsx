import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const sections = [
  {
    title: "Acceptance of terms",
    body: `By accessing or using Salon OS, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform. These terms apply to all users, including salon owners, staff members, and customers who book appointments.`,
  },
  {
    title: "Use of the platform",
    body: `You may use Salon OS only for lawful purposes and in accordance with these terms. You agree not to use the platform to transmit harmful, fraudulent, or illegal content; to impersonate any person or entity; or to interfere with the platform's operation or security.`,
  },
  {
    title: "Account responsibilities",
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately at support@salonos.in if you suspect unauthorised access to your account.`,
  },
  {
    title: "Subscription and billing",
    body: `Salon OS is offered on a subscription basis. Fees are billed monthly or annually as selected at signup. All fees are in Indian Rupees (₹) and are non-refundable except as required by law. We reserve the right to change pricing with 30 days' notice.`,
  },
  {
    title: "Data ownership",
    body: `You retain full ownership of all data you enter into Salon OS, including customer records, appointment history, and financial data. We do not claim any ownership over your data. Upon account termination, you may export your data within 30 days.`,
  },
  {
    title: "Intellectual property",
    body: `Salon OS and its original content, features, and functionality are owned by Salon OS and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our written permission.`,
  },
  {
    title: "Limitation of liability",
    body: `To the maximum extent permitted by law, Salon OS shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.`,
  },
  {
    title: "Termination",
    body: `We may suspend or terminate your account if you violate these terms. You may cancel your subscription at any time from your account settings. Upon termination, your right to use the platform ceases immediately.`,
  },
  {
    title: "Governing law",
    body: `These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.`,
  },
  {
    title: "Contact",
    body: `For questions about these terms, contact us at legal@salonos.in.`,
  },
];

const Terms = () => (
  <main>
    <Navbar />
    <div className="min-h-screen bg-background pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto space-y-10">

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Legal</p>
          <h1 className="font-display text-5xl text-foreground">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
          <p className="text-muted-foreground leading-relaxed">
            Please read these terms carefully before using Salon OS. By using our platform, you agree to these terms.
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

export default Terms;
