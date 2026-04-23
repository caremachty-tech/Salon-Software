import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { AISuite } from "@/components/landing/AISuite";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Salon OS — AI-powered salon management";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute("content", "Salon OS is the AI-powered operating system for modern salons. Bookings, billing, staff, inventory, and growth in one elegant platform.");
  }, []);

  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <AISuite />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;
